import React from 'react'
import dynamic from 'next/dynamic'
import { UIValues } from '../util/ui_values'

import { fetch_meta, fetch_meta_post } from '../util/fetch/meta'
import { get_signature_counts_per_resources } from '../components/Resources/resources.js'
import { get_metacounts,
  get_pie_stats,
  get_barcounts,
} from './index'

// import HomePage from '../components/Home'
const AdminPage = dynamic(() => import('../components/Admin'), { ssr: false })

async function fetch_count(source) {
  const { response } = await fetch_meta({ endpoint: `/${source}/count`,
  })
  return (response.count)
}

export async function get_counts(resource_count, ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
        endpoint: '/schemas/find',
        body: {
          filter: {
            where: {
              'meta.$validator': ui_values.counting_validator,
              'meta.Table_Count': true
            }
          },
        },
      })
  const resource_field = counting_fields.filter((item) => item.meta.Field_Name === 'resources')
  if (ui_values.preferred_name === undefined){
    ui_values.preferred_name = {}
  }
  const count_promise = counting_fields.filter((item) => item.meta.Field_Name !== 'resources').map(async (item) => {
    const count_stats = await fetch_count(item.meta.Field_Name)
    ui_values.preferred_name[item.meta.Field_Name] = item.meta.Preferred_Name
    return {
      table: item.meta.Field_Name,
      preferred_name: item.meta.Preferred_Name,
      icon: item.meta.MDI_Icon,
      Visible_On_Admin: item.meta.Visible_On_Admin,
      counts: count_stats,
    }
  })
  let table_counts = await Promise.all(count_promise)
  table_counts = resource_field.length > 0 ? [...table_counts, {
    table: resource_field[0].meta.Field_Name,
    preferred_name: resource_field[0].meta.Preferred_Name,
    icon: resource_field[0].meta.MDI_Icon,
    Visible_On_Admin: resource_field[0].meta.Visible_On_Admin,
    counts: resource_count,
  }] : table_counts
  return { table_counts, ui_values }
}

async function fetch_fields(source) {
  const { response: fields } = await fetch_meta({
    endpoint: `/${source}/key_count`,
  })
  return (fields)
}

async function get_signature_keys() {
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

export async function get_ui_values() {
  const { response: ui_val } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': "/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json",
            'meta.admin': true,
          }
        },
      },
    })
  console.log(ui_val)
  const ui_values = await UIValues["admin"](ui_val[0].meta.content)
  return {ui_values}
}

export default class Admin extends React.Component {
  static async getInitialProps() {
    const {ui_values} = await get_ui_values()
    const { resource_signatures, libraries, resources, library_resource } = await get_signature_counts_per_resources(ui_values)
    const { table_counts, ui_values: ui_val } = await get_counts(Object.keys(resources).length, ui_values)
    const { meta_counts } = await get_metacounts(ui_val)
    const { pie_fields_and_stats } = await get_pie_stats(ui_val)
    const signature_keys = await get_signature_keys()
    const { barcounts } = await get_barcounts(ui_val)
    const library_fields = await fetch_fields('libraries')
    const entity_fields = await fetch_fields('entities')
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
      library_fields,
      entity_fields,
    }
  }


  render() {
    return (
      <div><AdminPage {...this.props} /></div>
    )
  }
}
