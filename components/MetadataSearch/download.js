import DataProvider from '../../util/fetch/model'
import fileDownload from 'js-file-download'
import { objectMatch, default_schemas } from '../Label'
import { fetch_meta_post } from '../../util/fetch/meta'
import { makeTemplate } from '../../util/makeTemplate'
import NProgress from 'nprogress'

let cached_schemas = []

const gene_name = '${meta[\'Name\']}'

export async function fetch_schemas() {
  let schemas
  if (cached_schemas.length > 0) {
    schemas = cached_schemas
  } else {
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
    schemas = schema_db.map((schema) => (schema.meta))
    cached_schemas = schemas
  }
  return schemas
}

export function get_concatenated_meta(data, schemas) {
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
  const meta_list = sorted_entries.reduce((acc, entry) => {
    let val
    if (entry[0] === 'Description' || entry[0] === 'description') {
      val = 'undefined'
    } else if (entry[1].type === 'img' || entry[1].type === 'header-img') {
      val = makeTemplate(entry[1].alt, data)
    } else if (entry[1].type === 'object') {
      parent = makeTemplate(entry[1].text, data)
      val = parent !== 'undefined' ? makeTemplate(entry[1].subfield, data) : 'undefined'
    } else {
      val = makeTemplate(entry[1].text, data)
    }
    if (val !== 'undefined') {
      val = val.replace(/_/g, ' ')
      acc = [...acc, val]
    }
    return acc
  }, [])
  return (meta_list.join('_'))
}

export async function download_signature_json(item, name = undefined) {
  NProgress.start()
  let signature
  let filename = name
  if (typeof item === 'string') {
    signature = item
    filename = filename || signature
  } else if (typeof item === 'object' && 'id' in item) {
    signature = item.id
    const schemas = await fetch_schemas()
    filename = get_concatenated_meta(item, schemas)
  } else {
    console.error('Invalid item format', item)
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

export async function download_library_json(item, name = undefined) {
  NProgress.start()
  let library
  let filename = name
  if (typeof item === 'string') {
    library = item
    filename = filename || library
  } else if (typeof item === 'object' && 'id' in item) {
    library = item.id
    const schemas = await fetch_schemas()
    filename = get_concatenated_meta(item, schemas)
  } else {
    console.error('Invalid item format', item)
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

export async function download_resource_json(item, name = undefined) {
  NProgress.start()
  let resource
  let filename = name
  if (typeof item === 'string') {
    resource = item
    filename = filename || resource
  } else if (typeof item === 'object' && 'id' in item) {
    resource = item.id
    const schemas = await fetch_schemas()
    filename = get_concatenated_meta(item, schemas)
  } else {
    console.error('Invalid item format', item)
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

export async function get_signature(item, slice_rank = true, name) {
  NProgress.start()
  let sig
  let filename = name
  const schemas = await fetch_schemas()
  if (typeof item === 'string') {
    sig = item
    filename = filename || sig
  } else if (typeof item === 'object' && 'id' in item) {
    sig = item.id
    filename = get_concatenated_meta(item, schemas)
  } else {
    console.error('Invalid item format', item)
  }
  const provider = new DataProvider()
  const signature = await provider.resolve_signature(sig)
  const library = await signature.library
  const data = signature._signature
  data['library'] = library._library
  await provider.fetch_entities()
  const entities = signature._data.map((entity) => {
    return (makeTemplate(gene_name, entity._entity)) // TODO: Use ui_schemas here
  })
  NProgress.done()
  if (data.library.dataset_type === 'rank_matrix' && slice_rank) {
    return {
      data: entities.slice(0, 250),
      filename: filename,
    }
  } else {
    return {
      data: entities,
      filename: filename,
    }
  }
}

export async function download_signatures_text(item, name = undefined) {
  const { data, filename } = await get_signature(item, true, name)
  fileDownload(data.join('\n'), `${filename}.txt`)
}

export async function download_ranked_signatures_text(item, name = undefined) {
  const { data, filename } = await get_signature(item, false, name)
  fileDownload(`${filename}\t\t${data.join('\t')}`, `${filename}.gmt`)
}

export async function get_library_data(item, name) {
  const schemas = await fetch_schemas()
  let lib
  let filename = name
  if (typeof item === 'string') {
    lib = item
    filename = filename || lib
  } else if (typeof item === 'object' && 'id' in item) {
    lib = item.id
    filename = get_concatenated_meta(item, schemas)
  } else {
    console.error('Invalid item format', item)
  }

  const provider = new DataProvider()
  const library = await provider.resolve_library(lib)
  await library.meta

  filename = get_concatenated_meta(library._library, schemas)
  const signatures = await library.signatures

  await provider.resolve_signatures(signatures)
  await provider.fetch_data_for_signatures(signatures)
  await provider.fetch_entities()
  const mined_entity = {}
  const dataset = signatures.reduce((acc, signature) => {
    const data = signature._signature
    data['library'] = library._library
    const entities = signature._data.map((entity) => {
      if (!(entity._entity.id in mined_entity)) {
        mined_entity[entity._entity.id] = makeTemplate(gene_name, entity._entity) // Faster
      }
      return (mined_entity[entity._entity.id]) // TODO: Use ui_schemas here
    })
    const meta = get_concatenated_meta(data, schemas)
    acc[`${meta}_${data.id}`] = entities
    return acc
  }, {})
  return ({ dataset, filename })
}

export async function download_library_gmt(item, name = undefined) {
  NProgress.start()
  const { dataset, filename } = await get_library_data(item, name)
  const gmt = Object.keys(dataset).map((key) =>
    `${key}\t\t${dataset[key].join('\t')}`
  )
  NProgress.done()
  fileDownload(gmt.join('\n'), `${filename}.gmt`)
}


export async function download_library_tsv(item, name = undefined) {
  NProgress.start()
  console.time('fetch')
  const { dataset, filename } = await get_library_data(item, name)
  console.timeEnd('fetch')
  console.time('tsv')
  let columns = []
  const gmt = Object.keys(dataset).reduce((acc, sig) => {
    for (const entity of dataset[sig]) {
      // New gene not in previous signature
      if (!(entity in acc)) {
        const initial = columns.length == 0 ? `${entity}` :
                          `${entity}\t${Array(columns.length).fill(0).join('\t')}`
        acc[entity] = initial
      }
      // Put a 1 on that column for that gene and signatures
      acc[entity] = `${acc[entity]}\t1`
      // console.log(acc[entity])
    }
    const nonmember = Object.keys(acc).filter((ent) => (dataset[sig].indexOf(ent) === -1))
    for (const entity of nonmember) {
      acc[entity] = `${acc[entity]}\t0`
      // console.log(acc[entity])
    }
    columns = [...columns, sig]
    return (acc)
  }, {})
  console.timeEnd('tsv')
  NProgress.done()
  fileDownload(`${columns.join('\t')}\n${Object.values(gmt).join('\n')}`, `${filename}.tsv`)
}


export async function download_library_tsv1(lib) {
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
