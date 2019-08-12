import React from 'react'
import dynamic from 'next/dynamic'
import { fetch_meta, fetch_meta_post } from '../util/fetch/meta'
import { get_signature_counts_per_resources } from '../components/Resources/resources.js'
import { UIValues } from '../util/ui_values'

const Router = dynamic(async () => (await import('react-router-dom')).HashRouter, { ssr: false })
const Route = dynamic(async () => (await import('react-router-dom')).Route, { ssr: false })
const Admin = dynamic(() => import('../components/Admin'), { ssr: false })
const ArbitraryQuery = dynamic(() => import('../components/ArbitraryQuery'), { ssr: false })
const DBCK = dynamic(() => import('../components/DBCK'), { ssr: false })
const EntityPage = dynamic(() => import('../components/EntityPage'), { ssr: false })
const Home = dynamic(() => import('../components/Home'), { ssr: false })
const Stats = dynamic(() => import('../components/Stats'), { ssr: false })
const TermQuery = dynamic(() => import('../components/TermQuery'), { ssr: false })
const Tests = dynamic(() => import('../components/Tests'), { ssr: false })
const Values = dynamic(() => import('../components/Values'), { ssr: false })

export async function fetch_count(source) {
  const { response } = await fetch_meta({ endpoint: `/${source}/count`,
  })
  return response.count
}

export async function get_counts(resource_count, ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Table_Count': true,
        },
      },
    },
  })
  let table_counts
  if (counting_fields.length > 0) {
    if (ui_values.preferred_name === undefined) {
      ui_values.preferred_name = {}
    }
    const count_promise = counting_fields.filter((item) => item.meta.Field_Name !== 'resources').map(async (item) => {
      const count_stats = await fetch_count(item.meta.Field_Name)
      ui_values.preferred_name[item.meta.Field_Name] = item.meta.Preferred_Name
      return {
        table: item.meta.Field_Name,
        preferred_name: item.meta.Preferred_Name,
        icon: item.meta.MDI_Icon,
        Visible_On_Landing: item.meta.Visible_On_Landing,
        counts: count_stats,
      }
    })
    table_counts = await Promise.all(count_promise)
    const resource_field = counting_fields.filter((item) => item.meta.Field_Name === 'resources')
    if (resource_field.length > 0) {
      table_counts = [...table_counts, {
        table: resource_field[0].meta.Field_Name,
        preferred_name: resource_field[0].meta.Preferred_Name,
        icon: resource_field[0].meta.MDI_Icon,
        Visible_On_Landing: resource_field[0].meta.Visible_On_Landing,
        counts: resource_count,
      }]
      ui_values.preferred_name[resource_field[0].meta.Field_Name] = resource_field[0].meta.Preferred_Name
    }
  } else {
    if (ui_values.preferred_name !== undefined) {
      const count_promise = Object.keys(ui_values.preferred_name).filter((key) => key !== 'resources').map(async (key) => {
        const count_stats = await fetch_count(key)
        return {
          table: key,
          preferred_name: ui_values.preferred_name[key],
          Visible_On_Landing: count_stats > 0,
          icon: 'mdi-arrow-top-right-thick',
          counts: count_stats,
        }
      })
      table_counts = await Promise.all(count_promise)
      if ('resources' in ui_values.preferred_name) {
        table_counts = [...table_counts, {
          table: 'resources',
          preferred_name: ui_values.preferred_name['resources'],
          Visible_On_Landing: resource_count > 0,
          icon: 'mdi-arrow-top-right-thick',
          counts: resource_count,
        }]
      }
    }
  }
  return { table_counts, ui_values }
}

export async function get_metacounts(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Meta_Count': true,
        },
      },
    },
  })
  if (counting_fields.length === 0) {
    return ({ meta_counts: {} })
  }

  const meta_promise = counting_fields.map(async (entry) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${entry.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [entry.meta.Field_Name],
        },
      },
    })
    return meta_stats
  })

  const meta = await Promise.all(meta_promise)
  const meta_stats = meta.reduce((mapping, item) => {
    mapping = { ...item, ...mapping }
    return mapping
  }, {})
  const meta_counts = counting_fields.reduce((stat_list, item) => {
    const k = item.meta.Field_Name
    stat_list.push({ name: item.meta.Preferred_Name,
      counts: Object.keys(meta_stats[k] || {}).length,
      icon: item.meta.MDI_Icon,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Field_Name })
    return (stat_list)
  }, [])

  meta_counts.sort((a, b) => parseFloat(b.counts) - parseFloat(a.counts))
  return { meta_counts }
}

export async function get_pie_stats(ui_values) {
  const { response: piefields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Pie_Count': true,
        },
      },
    },
  })

  const meta_promise = piefields.map(async (entry) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${entry.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [entry.meta.Field_Name],
        },
      },
    })
    return meta_stats
  })

  const meta = await Promise.all(meta_promise)
  const meta_stats = meta.reduce((mapping, item) => {
    mapping = { ...item, ...mapping }
    return mapping
  }, {})
  const pie_stats = piefields.map((item) => {
    return {
      key: item.meta.Preferred_Name || item.meta.Field_Name,
      Preferred_Name: item.meta.Preferred_Name_Singular || item.meta.Preferred_Name || item.meta.Field_Name,
      table: item.meta.Table,
      stats: meta_stats[item.meta.Field_Name],
      slice: item.meta.Slice || 14,
    }
  })
  const pie_fields_and_stats = pie_stats.reduce((piestats, stats) => {
    piestats[stats.key] = { stats: stats.stats, table: ui_values.preferred_name[stats.table], Preferred_Name: stats.Preferred_Name, slice: stats.slice }
    return piestats
  }, {})

  return { pie_fields_and_stats }
}

export async function get_barcounts(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Bar_Count': true,
        },
      },
    },
  })
  const meta_promise = counting_fields.map(async (item) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${item.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [item.meta.Field_Name],
        },
      },
    })
    const stats = Object.keys(meta_stats[item.meta.Field_Name] || {}).reduce((accumulator, bar) => {
      const count = meta_stats[item.meta.Field_Name][bar]
      if (bar === '2017b') {
        if (accumulator['2017'] === undefined) {
          accumulator['2017'] = count
        } else {
          accumulator['2017'] = accumulator['2017'] + count
        }
      } else {
        if (accumulator[bar] === undefined) {
          accumulator[bar] = count
        } else {
          accumulator[bar] = accumulator[bar] + count
        }
      }
      return accumulator
    }, {}) // TODO: Fix this as schema
    return { field: item.meta.Field_Name, stats: stats }
  })

  const meta = await Promise.all(meta_promise)
  const barcounts = meta.reduce((accumulator, item) => {
    accumulator[item.field] = Object.keys(item.stats).map((key) => ({ name: key, counts: item.stats[key] }))
    return accumulator
  }, {})
  return { barcounts }
}

export async function get_signature_keys() {
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })
  const signature_keys_promises = libraries.map(async (lib) => {
    const libid = lib.id
    const { response: fields } = await fetch_meta({
      endpoint: `/libraries/${libid}/signatures/key_count`,
    })
    return {
      id: libid,
      keys: Object.keys(fields),
    }
  })
  const sigkeys = await Promise.all(signature_keys_promises)
  const signature_keys = sigkeys.reduce((keys, sig) => {
    keys[sig.id] = sig.keys
    return keys
  }, {})
  return signature_keys
}

export async function get_schemas(ui_values) {
  const { response: schema_db } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.ui_schema,
        },
      },
    },
  })
  const schemas = schema_db.map((schema) => (schema.meta))
  return schemas
}

export async function get_ui_values() {
  const { response: ui_val } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json',
          'meta.landing': true,
        },
      },
    },
  })
  const values = ui_val.length > 0 ? ui_val[0].meta.content : {}
  const ui_values = await UIValues['landing'](values)
  return { ui_values }
}

const App = (props) => (
  <div className="root">
    <Router>
      <div className="root">
        <Route path="/" render={(router_props) => <Home {...props} {...router_props}/>} />
        <Route exact path="/admin" render={(router_props) => <Admin {...props} {...router_props}/>} />
        <Route exact path="/arbitrary-query" component={ArbitraryQuery} />
        <Route exact path="/dbck" component={DBCK} />
        <Route exact path="/entity-page" component={EntityPage} />
        <Route exact path="/stats" component={Stats} />
        <Route exact path="/term-query" component={TermQuery} />
        <Route exact path="/values" component={Values} />
        <Route exact path="/tests" component={Tests} />
      </div>
    </Router>
  </div>
)

App.getInitialProps = async () => {
  const { ui_values } = await get_ui_values()
  // Check if it has library_name and resource_from_library
  const schemas = await get_schemas(ui_values)
  const { resource_signatures, libraries, resources, library_resource } = await get_signature_counts_per_resources(ui_values, schemas)
  const { table_counts, ui_values: ui_val } = await get_counts(Object.keys(resources).length, ui_values)
  const { meta_counts } = await get_metacounts(ui_val)
  const { pie_fields_and_stats } = await get_pie_stats(ui_val)
  const signature_keys = await get_signature_keys()
  const { barcounts } = await get_barcounts(ui_val)
  return {
    table_counts,
    meta_counts,
    resource_signatures,
    pie_fields_and_stats,
    barcounts,
    signature_keys,
    libraries,
    resources,
    library_resource,
    ui_values: ui_val,
    schemas,
  }
}

export default App
