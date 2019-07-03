import React from 'react'
import dynamic from 'next/dynamic'
import { fetch_meta, fetch_meta_post } from '../util/fetch/meta'
import { get_signature_counts_per_resources } from '../components/Resources/resources.js'

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
  return (response.count)
}

export async function get_counts(resource_count, ui_content) {
  const { response: counting_fields } = await fetch_meta_post({
        endpoint: '/schemas/find',
        body: {
          filter: {
            where: {
              'meta.$validator': ui_content.content.counting_validator,
              'meta.Table_Count': true
            }
          },
        },
      })

  const resource_field = counting_fields.filter((item) => item.meta.Field_Name === 'resources')
  if (ui_content.content.preferred_name === undefined){
    ui_content.content.preferred_name = {}
  }
  const count_promise = counting_fields.filter((item) => item.meta.Field_Name !== 'resources').map(async (item) => {
    const count_stats = await fetch_count(item.meta.Field_Name)
    ui_content.content.preferred_name[item.meta.Field_Name] = item.meta.Preferred_Name
    return {
      table: item.meta.Field_Name,
      preferred_name: item.meta.Preferred_Name,
      icon: item.meta.MDI_Icon,
      Visible_On_Landing: item.meta.Visible_On_Landing,
      counts: count_stats,
    }
  })
  let table_counts = await Promise.all(count_promise)
  table_counts = resource_field.length > 0 ? [...table_counts, {
    table: resource_field[0].meta.Field_Name,
    preferred_name: resource_field[0].meta.Preferred_Name,
    icon: resource_field[0].meta.MDI_Icon,
    Visible_On_Landing: resource_field[0].meta.Visible_On_Landing,
    counts: resource_count,
  }] : table_counts
  return { table_counts, ui_content }
}

export async function get_metacounts(ui_content) {
  const { response: counting_fields } = await fetch_meta_post({
        endpoint: '/schemas/find',
        body: {
          filter: {
            where: {
              'meta.$validator': ui_content.content.counting_validator,
              'meta.Meta_Count': true
            }
          },
        },
      })

  const per_table_fields = counting_fields.reduce((tables, item) => {
    if (tables[item.meta.Table] === undefined) {
      tables[item.meta.Table] = [item.meta.Field_Name]
    } else {
      tables[item.meta.Table] = [...tables[item.meta.Table], item.meta.Field_Name]
    }
    return tables
  }, {})

  const meta_promise = Object.keys(per_table_fields).map(async (table) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: per_table_fields[table],
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
    const k = item.meta.Type === 'object' ? `${item.meta.Field_Name}.Name` : item.meta.Field_Name
    stat_list.push({ name: k.indexOf('PubChemID') !== -1 ?
                             k.replace('Small_Molecule.', '') :
                             k.replace('.Name', ''),
    counts: Object.keys(meta_stats[k] || {}).length,
    icon: item.meta.MDI_Icon,
    Preferred_Name: item.meta.Preferred_Name })
    return (stat_list)
  }, [])

  meta_counts.sort((a, b) => parseFloat(b.counts) - parseFloat(a.counts))
  return { meta_counts }
}

export async function get_pie_stats(ui_content) {
  const { response: pie_schema } = await fetch_meta_post({
        endpoint: '/schemas/find',
        body: {
          filter: {
            where: {
              'meta.$validator': ui_content.content.counting_validator,
              'meta.Pie_Count': true
            }
          },
        },
      })
  const piefields = pie_schema.map((item) => (item.meta.Field_Name))

  const { response: meta_stats } = await fetch_meta({
    endpoint: '/signatures/value_count',
    body: {
      depth: 2,
      filter: {
        fields: piefields,
      },
    },
  })
  const pie_stats = pie_schema.map((item) => {
    if (item.meta.Type === 'object') {
      return {
        key: item.meta.Field_Name,
        stats: meta_stats[item.meta.Field_Name + '.Name'],
      }
    } else {
      return {
        key: item.meta.Field_Name,
        stats: meta_stats[item.meta.Field_Name],
      }
    }
  })
  const pie_fields_and_stats = pie_stats.reduce((piestats, stats) => {
    piestats[stats.key] = stats.stats
    return piestats
  }, {})
  return { pie_fields_and_stats }
}

export async function get_barcounts(ui_content) {
  const { response: counting_fields } = await fetch_meta_post({
        endpoint: '/schemas/find',
        body: {
          filter: {
            where: {
              'meta.$validator': ui_content.content.counting_validator,
              'meta.Bar_Count': true
            }
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

export async function get_schemas(ui_content){
  const { response: schema_db } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': ui_content.content.ui_schema,
          }
        },
      },
    })
  const schemas = schema_db.map((schema)=>(schema.meta))
  return schemas
}

export async function get_ui_content() {
  const { response: ui_cont } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': "/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json",
            'meta.landing': true,
          }
        },
      },
    })
  if (ui_cont.length > 0) {
    return {ui_content: ui_cont[0].meta}
  }
  return { ui_content: {} }
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
  const {ui_content} = await get_ui_content()
  // Check if it has library_name and resource_from_library
  if (ui_content.content === undefined || Object.keys(ui_content.content).length === 0) {
    return {
      error: 'ui schema is undefined',
    }
  }
  if (ui_content.content.library_name === undefined) {
    return {
      error: 'Missing library_name on ui schema',
    }
  }
  if (ui_content.content.resource_from_library === undefined || ui_content.content.resource_from_library.length === 0) {
    return {
      error: 'Missing/Empty resource_from_library',
    }
  }
  if (ui_content.content.signature_search === undefined) {
    ui_content.content.signature_search = true
  }
  if (ui_content.content.metadata_search === undefined) {
    ui_content.content.metadata_search = true
  }
  if (ui_content.content.resources === undefined) {
    ui_content.content.resources = true
  }
  const schemas = await get_schemas(ui_content)
  const { resource_signatures, libraries, resources, library_resource } = await get_signature_counts_per_resources(ui_content)
  const { table_counts, ui_content: ui_cont } = await get_counts(Object.keys(resources).length, ui_content)
  const { meta_counts } = await get_metacounts(ui_cont)
  const { pie_fields_and_stats } = await get_pie_stats(ui_cont)
  const signature_keys = await get_signature_keys()
  const { barcounts } = await get_barcounts(ui_cont)
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
    ui_content: ui_cont,
    schemas
  }
}

export default App
