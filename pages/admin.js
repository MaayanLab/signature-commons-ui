import React from 'react'
import dynamic from 'next/dynamic'

import { fetch_meta } from '../util/fetch/meta'
import {get_signature_counts_per_resources} from '../components/Resources/resources.js'



// import HomePage from '../components/Home'
const AdminPage = dynamic(() => import('../components/Admin'), { ssr: false })

async function fetch_count(source) {
  const { response } = await fetch_meta({ endpoint: `/${source}/count`
                                        })
  return(response.count)
}

async function fetch_fields(source) {
  const { response: fields} = await fetch_meta({
    endpoint: `/${source}/key_count`
  })
  return(fields)
}


async function get_metacounts(){
  const counting_fields = (await import("../ui-schemas/dashboard/counting_fields.json")).default
  const preferred_name = (await import("../ui-schemas/dashboard/preferred_name.json")).default
  const object_fields = Object.keys(counting_fields).filter(key=>counting_fields[key]=="object")
  const { response: meta_stats } = await fetch_meta({
    endpoint: '/signatures/value_count',
    body: {
      depth: 2,
      filter: {
        fields: Object.keys(counting_fields)
      },
    },
  })
  let meta_counts = Object.keys(meta_stats).filter(key=>key.indexOf(".Name")>-1||
                                                      // (key.indexOf(".PubChemID")>-1 &&
                                                      //  key.indexOf("Small_Molecule")>-1) ||
                                                      (key.indexOf(".")===-1 && object_fields.indexOf(key)===-1))
                                              .reduce((stat_list, k)=>{
                                              stat_list.push({name: k.indexOf('PubChemID')!==-1 ? 
                                                                      k.replace("Small_Molecule.", ""):
                                                                      k.replace(".Name", ""),
                                                              counts:Object.keys(meta_stats[k]).length})
                                              return(stat_list) },
                                              [])
  meta_counts.sort((a, b) => parseFloat(b.counts) - parseFloat(a.counts));
  return {meta_counts, counting_fields, preferred_name}
}


export default class Admin extends React.Component {

  static async getInitialProps() {
    const LibraryNumber = await fetch_count("libraries")
    const SignatureNumber = await fetch_count("signatures")
    const EntityNumber = await fetch_count("entities")
    const library_fields = await fetch_fields("libraries")
    const entity_fields = await fetch_fields("entities")
    const {meta_counts, counting_fields, preferred_name} = await get_metacounts()
    const {resource_signatures} = await get_signature_counts_per_resources()
    const piefields = (await import("../ui-schemas/dashboard/pie_fields.json")).default
    return {
      LibraryNumber,
      SignatureNumber,
      EntityNumber,
      library_fields,
      entity_fields,
      meta_counts,
      counting_fields,
      preferred_name,
      resource_signatures,
      piefields,
    }
  }

  

  render() {
    return (
      <div><AdminPage {...this.props} /></div>
    )
  }
}
