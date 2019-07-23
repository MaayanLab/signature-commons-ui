import DataProvider from '../../util/fetch/model'
import fileDownload from 'js-file-download'
import { objectMatch, default_schemas } from '../Label'
import { fetch_meta_post } from '../../util/fetch/meta'
import { makeTemplate } from '../../util/makeTemplate'
import NProgress from 'nprogress'


export async function get_concatenated_meta(data){
  const { response: schema_db } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json',
          },
        },
      },
    })
  const schemas = schema_db.map((schema) => (schema.meta))
  let matched_schemas = schemas.filter(
      (schema) => objectMatch(schema.match, data)
  )
  // default if there is no match
  if (matched_schemas.length < 1) {
    matched_schemas = default_schemas.filter(
        (schema) => objectMatch(schema.match, data)
    )
  }
  if (matched_schemas.length < 1) {
    console.error('Could not match ui-schema for data', data)
    return null
  }
  const schema = matched_schemas[0]
  const sorted_entries = Object.entries(schema.properties).sort((a, b) => a[1].priority - b[1].priority)
  const meta_list = sorted_entries.reduce((acc, entry)=>{
    let val
    if (entry[0]==="Description" || entry[0]==="description"){
      val = 'undefined'
    }
    else if(entry[1].type === 'img' || entry[1].type === 'header-img'){
      val = makeTemplate(entry[1].alt, data)
    }else if(entry[1].type==='object'){
      parent = makeTemplate(entry[1].text, data)
      val = parent !== 'undefined' ? makeTemplate(entry[1].subfield, data): 'undefined'
    }else {
      val = makeTemplate(entry[1].text, data)
    }
    if ( val !== 'undefined' ){
      val = val.replace(/_/g, ' ')
      acc = [...acc, val]
    }
    return acc
  }, [])
  return (meta_list.join("_"))
}

export async function download_signature_json(item, name=undefined) {
  NProgress.start()
  let signature
  let filename = name
  if (typeof item === 'string'){
    signature = item
    filename = filename || `${signature}.json`
  }else if (typeof item === 'object' && "id" in item){
    signature = item.id
    filename = await get_concatenated_meta(item)
  }else{
    console.error("Invalid item format", item)
  }
  const provider = new DataProvider()
  const data = await provider.serialize_signature(signature, {
    resource: true,
    library: true,
    data: true,
  })
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

export async function download_library_json(item, name=undefined) {
  NProgress.start()
  let library
  let filename = name
  if (typeof item === 'string'){
    library = item
    filename = filename || `${library}.json`
  }else if (typeof item === 'object' && "id" in item){
    library = item.id
    filename = await get_concatenated_meta(item)
  }else{
    console.error("Invalid item format", item)
  }
  const provider = new DataProvider()
  const data = await provider.serialize_library(library, {
    resource: true,
    library: true,
    signatures: true,
    data: true,
  })
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

export async function download_resource_json(item, name=undefined) {
  NProgress.start()
  let resource
  let filename = name
  if (typeof item === 'string'){
    resource = item
    filename = filename || `${resource}.json`
  }else if (typeof item === 'object' && "id" in item){
    resource = item.id
    filename = await get_concatenated_meta(item)
  }else{
    console.error("Invalid item format", item)
  }
  const provider = new DataProvider()
  const data = await provider.serialize_resource(resource, {
    libraries: true,
    signatures: true,
    data: true,
  })
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

export async function download_signatures_text(item, name=undefined){
  NProgress.start()
  let sig
  let filename = name
  if (typeof item === 'string'){
    sig = item
    filename = filename || `${sig}.json`
  }else if (typeof item === 'object' && "id" in item){
    sig = item.id
    filename = await get_concatenated_meta(item)
  }else{
    console.error("Invalid item format", item)
  }
  const provider = new DataProvider()
  const signature = await provider.resolve_signature(sig)
  const signature_data = await signature.data
  const library = await signature.library
  const data = signature._signature
  data["library"] = library._library
  await provider.fetch_entities()
  const entities = await Promise.all(signature_data.map(async (entity) =>{
      const entity_meta = await entity.meta
      return(entity_meta.Name) // TODO: Use ui_schemas here
    }))
  NProgress.done()
  if (data.library.dataset_type==="rank_matrix"){
    fileDownload(entities.slice(0, 250).join('\n'), `${filename}.txt`)
  }else{
    fileDownload(entities.join('\n'), `${filename}.txt`)
  }
}


export async function download_library_tsv(lib) {
  const provider = new DataProvider()
  const library = provider.resolve_library(lib)
  const signatures = await library.signatures

  const col_labels = new Set(['id'])
  const col_headers = {}
  const row_labels = new Set(['id'])
  const row_headers = {}

  for (const signature of signatures) {
    const signature_id = await signature.id
    const signature_meta = await signature.meta
    col_headers[signature_id] = {}
    for (const key of Object.keys(signature_meta)) {
      col_labels.add(key)
      col_headers[signature_id][key] = JSON.stringify(signature_meta[key])
    }

    const signature_data = await signature.data

    for (const entity of signature_data) {
      const entity_id = await entity.id
      if (row_headers[entity_id] !== undefined) {
        continue
      }
      row_headers.id = entity_id
      row_headers[entity_id] = {}
      const entity_meta = await entity.meta
      for (const key of Object.keys(entity_meta)) {
        row_labels.add(key)
        row_headers[key] = JSON.stringify(entity_meta[key])
      }
    }
  }
  console.log(col_headers)
  let result = ''
  for (const col_label of col_labels) {
    console.log(col_label)
    result += `${'\t'.repeat(row_labels.length)}\t${col_headers[col_label].join('\t')}\n`
  }
  result += `${row_labels.join('\t')}\t${'\t'.repeat(signatures.length)}\n`
  for (const row of row_headers) {
    result += `${row_labels.map((row_label) => row[row_label]).join('\t')}\t${'1'.repeat(row.length)}\n`
  }

  fileDownload(result, 'data.tsv')
}
