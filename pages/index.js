import React from 'react'
import dynamic from 'next/dynamic'
import { fetch_meta } from '../util/fetch/meta'
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

async function fetch_count(source) {
  const { response } = await fetch_meta({ endpoint: `/${source}/count`,
  })
  return (response.count)
}

async function get_counts(resource_count) {
  const landing_ui = (await import('../ui-schemas/dashboard/landing_ui_mcf10a.json')).default
  const counting_fields = landing_ui.filter((item)=>item.Table_Count)
  const resource_field = counting_fields.filter((item)=>item.Field_Name==='resources')
  const count_promise = counting_fields.filter((item)=>item.Field_Name!=='resources').map( async (item)=> {
    const count_stats = await fetch_count(item.Field_Name)
    return {table: item.Field_Name,
            preferred_name: item.Preferred_Name,
            icon:item.MDI_Icon,
            Visible_On_Landing: item.Visible_On_Landing,
            counts: count_stats}
  })
  let table_counts = await Promise.all(count_promise)
  table_counts = resource_field.length > 0 ? [...table_counts, {table:resource_field[0].Field_Name,
                                                                preferred_name: resource_field[0].Preferred_Name,
                                                                icon: resource_field[0].MDI_Icon,
                                                                Visible_On_Landing: resource_field[0].Visible_On_Landing,
                                                                counts: resource_count}] : table_counts
  return table_counts
}

async function get_metacounts() {
  const landing_ui = (await import('../ui-schemas/dashboard/landing_ui_mcf10a.json')).default
  const counting_fields = landing_ui.filter((item)=>item.Meta_Count)
  
  const per_table_fields = counting_fields.reduce((tables, item) => {
    if (tables[item.Table] === undefined) {
      tables[item.Table] = [item.Field_Name]
    } else{
      tables[item.Table] = [...tables[item.Table], item.Field_Name]
    }
    return(tables)
  }, {})

  const meta_promise = Object.keys(per_table_fields).map( async (table)=> {
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
  const meta_stats = meta.reduce((mapping, item)=>{
    mapping = {...item, ...mapping}
    return mapping
  }, {})
  const object_fields = counting_fields.filter((item)=>item.Type==='object')
  const meta_counts = landing_ui.filter((item)=>item.Meta_Count).reduce((stat_list, item)=>{
    const k = item.Type==="object" ? `${item.Field_Name}.Name`: item.Field_Name
    stat_list.push({ name: k.indexOf('PubChemID')!==-1 ?
                             k.replace('Small_Molecule.', ''):
                             k.replace('.Name', ''),
                     counts: Object.keys(meta_stats[k]).length,
                     icon: item.MDI_Icon,
                     Preferred_Name: item.Preferred_Name})
    return (stat_list)
  }, [])

  meta_counts.sort((a, b) => parseFloat(b.counts) - parseFloat(a.counts))
  return { meta_counts }
}

async function get_pie_stats() {
  const landing_ui = (await import('../ui-schemas/dashboard/landing_ui_mcf10a.json')).default
  const pie_schema = landing_ui.filter((item)=>item.Pie_Count)
  const piefields = pie_schema.map((item)=>(item.Field_Name))

  const { response: meta_stats } = await fetch_meta({
    endpoint: '/signatures/value_count',
    body: {
      depth: 2,
      filter: {
        fields: piefields,
      },
    },
  })
  const pie_stats = pie_schema.map((item)=>{
    if (item.Type==="object") {
      return {
        key: item.Field_Name,
        stats: meta_stats[item.Field_Name+'.Name'],
      }
    } else {
      return {
        key: item.Field_Name,
        stats: meta_stats[item.Field_Name],
      }
    }
  })
  const pie_fields_and_stats = pie_stats.reduce((piestats, stats) => {
    piestats[stats.key] = stats.stats
    return piestats
  }, {})
  return { pie_fields_and_stats }
}

async function get_barcounts() {
  const landing_ui = (await import('../ui-schemas/dashboard/landing_ui_mcf10a.json')).default
  const counting_fields = landing_ui.filter((item)=>item.Bar_Count)
  const meta_promise = counting_fields.map( async (item)=> {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${item.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [item.Field_Name],
        },
      },
    })
    const stats = Object.keys(meta_stats[item.Field_Name]).reduce((accumulator, bar)=>{
      const count = meta_stats[item.Field_Name][bar]
      if(bar==="2017b"){
        if(accumulator["2017"]===undefined){
          accumulator["2017"] = count
        }else {
          accumulator["2017"] = accumulator["2017"]+ count
        }
      }else {
        if(accumulator[bar]===undefined){
          accumulator[bar] = count
        }else {
          accumulator[bar] = accumulator[bar]+ count
        }
      }
      return accumulator
    }, {}) // TODO: Fix this as schema
    return {field: item.Field_Name, stats: stats}
  })
  
  const meta = await Promise.all(meta_promise)
  const barcounts = meta.reduce((accumulator, item)=>{
    accumulator[item.field] = Object.keys(item.stats).map((key)=>({ name: key, counts: item.stats[key] }))
    return accumulator
  },{})
  return { barcounts }
}

async function get_signature_keys() {
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })
  const signature_keys_promises = libraries.map(async (lib) =>{
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

async function get_ui_content() {
  const ui_json = (await import('../ui-schemas/dashboard/ui.json')).default
  const ui_content = ui_json.filter((item)=>item.landing)
  if (ui_content.length>0){
    return ui_content[0]
  }
  return {content:{}}
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
  const { resource_signatures, libraries, resources, library_resource } = await get_signature_counts_per_resources()
  const table_counts = await get_counts(Object.keys(resources).length)
  const { meta_counts } = await get_metacounts()
  const { pie_fields_and_stats } = await get_pie_stats()
  const signature_keys = await get_signature_keys()
  const { barcounts } = await get_barcounts()
  const ui_content = await get_ui_content()
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
    ui_content
  }
}

export default App
