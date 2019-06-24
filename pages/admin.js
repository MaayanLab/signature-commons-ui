import React from 'react'
import dynamic from 'next/dynamic'

import { fetch_meta } from '../util/fetch/meta'
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

export async function get_counts(resource_count, ui_content) {
  const landing_ui = (await import('../ui-schemas/dashboard/landing_ui_mcf10a.json')).default
  const counting_fields = landing_ui.filter((item) => item.Table_Count)
  const resource_field = counting_fields.filter((item) => item.Field_Name === 'resources')
  ui_content.content.preferred_name = {}
  const count_promise = counting_fields.filter((item) => item.Field_Name !== 'resources').map(async (item) => {
    const count_stats = await fetch_count(item.Field_Name)
    ui_content.content.preferred_name[item.Field_Name] = item.Preferred_Name
    return {
      table: item.Field_Name,
      preferred_name: item.Preferred_Name,
      icon: item.MDI_Icon,
      Visible_On_Admin: item.Visible_On_Admin,
      counts: count_stats,
    }
  })
  let table_counts = await Promise.all(count_promise)
  table_counts = resource_field.length > 0 ? [...table_counts, {
    table: resource_field[0].Field_Name,
    preferred_name: resource_field[0].Preferred_Name,
    icon: resource_field[0].MDI_Icon,
    Visible_On_Admin: resource_field[0].Visible_On_Admin,
    counts: resource_count,
  }] : table_counts
  return { table_counts, ui_content }
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

async function get_ui_content() {
  const ui_json = (await import('../ui-schemas/dashboard/ui.json')).default
  const ui_content = ui_json.filter((item) => item.admin)
  if (ui_content.length > 0) {
    return ui_content[0]
  }
  return { content: {} }
}

export default class Admin extends React.Component {
  static async getInitialProps() {
    const ui_content = await get_ui_content()
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
    const resource_from_library = ui_content.content.resource_from_library
    const { resource_signatures, libraries, resources, library_resource } = await get_signature_counts_per_resources(resource_from_library)
    const { table_counts, ui_content: ui_cont } = await get_counts(Object.keys(resources).length, ui_content)
    const { meta_counts } = await get_metacounts()
    const { pie_fields_and_stats } = await get_pie_stats()
    const signature_keys = await get_signature_keys()
    const { barcounts } = await get_barcounts()
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
      ui_content: ui_cont,
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
