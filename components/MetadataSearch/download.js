import DataProvider from '../../util/fetch/model'
import fileDownload from 'js-file-download'
import { objectMatch, default_schemas } from '../../util/objectMatch'
import { fetch_meta_post } from '../../util/fetch/meta'
import { makeTemplate } from '../../util/makeTemplate'
import NProgress from 'nprogress'

let cached_schemas = []

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

export function get_label(data, schemas, schema_filter={}) {
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

  let label
  let name_prop
  for (const key in schema.properties) {
    if (schema.properties[key].name) {
      const val = schema.properties[key]
      name_prop = val
      break
    }
  }
  if (name_prop !== undefined) {
    label = makeTemplate(name_prop.text, data)
  } else {
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
    label = meta_list.join('_')
  }


  return label
}

export async function download_signature_json(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const data = await provider.serialize_signature(item, {
    resource: true,
    library: true,
    data: true,
    validator: true,
  })
  const filename = get_label(data, schemas)
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

export async function download_library_json(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const data = await provider.serialize_library(item, {
    resource: true,
    library: true,
    signatures: true,
    data: true,
    validator: true,
  })
  const filename = get_label(data, schemas)
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

export async function download_resource_json(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const data = await provider.serialize_resource(item, {
    libraries: true,
    signatures: true,
    data: true,
    validator: true,
  })
  const filename = get_label(data, schemas)
  NProgress.done()
  fileDownload(JSON.stringify(data), `${filename}.json`)
}

// export async function get_resource(item, schemas=undefined, provider=undefined){
//   if (schemas===undefined) schemas = await fetch_schemas()
//   if (provider===undefined) provider = new DataProvider()
//   const resource = await provider.resolve_resource(item)
//   const resource_id = await resource.id
//   const resource_meta = await resource.meta
//   const resource_validator = await resource.validator
//   return ({
//     id: resource_id,
//     $validator: resource_validator,
//     meta: resource_meta,
//   })
// }

// export async function get_library(item, schemas=undefined, provider=undefined){
//   if (schemas===undefined) schemas = await fetch_schemas()
//   if (provider===undefined) provider = new DataProvider()
//   const library = await provider.resolve_library(item)
//   const library_id = await library.id
//   const library_meta = await library.meta
//   const library_validator = await library.validator
//   const library_dataset = await library.dataset
//   const library_dataset_type = await library.dataset_type
//   const resource = await get_resource({item: await library.resource, provider, schemas})
//   return ({
//     id: library_id,
//     $validator: library_validator,
//     meta: library_meta,
//     dataset: library_dataset,
//     dataset_type: library_dataset_type,
//     resource
//   })
// }

export async function get_entities(item, schemas = undefined, provider = undefined) {
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const _entities = await provider.resolve_entities(items)
  const entities = await Promise.all(await _entities.map(async (_ent) => ({
    id: await _ent.id,
    meta: await _ent.meta,
    $validator: await _ent.validator,
  })))
  return entities
}

export async function download_signatures_text(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const signature = await get_signature({ item, schemas, provider })
  const filename = get_label(signature, schemas)
  let data
  const entity_schemas = schemas.filter(i=>i.type==="entity")
  if (signature.library.dataset_type === 'rank_matrix') {
    data = signature.data.slice(0, 250).map((d) => get_label(d, entity_schemas))
  } else {
    data = signature.data.map((d) => get_label(d, entity_schemas))
  }
  NProgress.done()
  fileDownload(data.join('\n'), `${filename}.txt`)
}

export async function download_ranked_signatures_text(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const signature = await provider.serialize_signature(item, {
    resource: true,
    library: true,
    data: true,
    validator: true,
  })
  const filename = get_label(signature, schemas)
  const entity_schemas = schemas.filter(i=>i.type==="entity")
  const data = signature.data.map((d) => get_label(d, entity_schemas))
  NProgress.done()
  fileDownload(`${filename}\t\t${data.join('\t')}`, `${filename}.gmt`)
}

export async function get_library({ item, schemas, provider, opts }) {
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  if (opts === undefined) {
    opts = {
      resource: true,
      library: true,
      signatures: true,
      data: false,
      validator: true,
    }
  }
  const library = await provider.serialize_library(item, opts)
  return library
}

export async function get_signature({ item, schemas, provider, opts }) {
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  if (opts === undefined) {
    opts = {
      resource: false,
      library: true,
      data: true,
      validator: true,
    }
  }
  const signature = await provider.serialize_signature(item, opts)
  return (signature)
}

export async function get_signature_data({ item, schemas, provider, search_type }) {
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const signature = await get_signature({ item, schemas, provider })
  let data
  if (signature.library.dataset_type === 'rank_matrix') {
    if (search_type === 'Overlap') {
      data = {
        entities: signature.data.slice(0, 250).reduce((acc, item) => {
          acc = {
            ...acc,
            [get_label(item, schemas)]: item,
          }
          return acc
        }, {}),
      }
    } else {
      data = {
        up_entities: signature.data.slice(0, 250).reduce((acc, item) => {
          acc = {
            ...acc,
            [get_label(item, schemas)]: item,
          }
          return acc
        }, {}),
        down_entities: signature.data.slice((signature.data.length - 250)).reduce((acc, item) => {
          acc = {
            ...acc,
            [get_label(item, schemas)]: item,
          }
          return acc
        }, {}),
      }
    }
  } else {
    if (search_type === 'Rank') {
      throw new Error('\'non rank matrix genesets can\'t be fed to Rank search\'')
    }
    data = {
      entities: signature.data.reduce((acc, item) => {
        acc = {
          ...acc,
          [get_label(item, schemas)]: item,
        }
        return acc
      }, {}),
    }
  }
  return (data)
}

export async function download_library_gmt(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const library = await get_library({ item,
    provider,
    schemas,
    opts: {
      resource: false,
      library: true,
      signatures: true,
      data: true,
      validator: true,
    },
  })
  const filename = get_label(library, schemas)
  let dataset = []
  for (const signature of library.signatures) {
    const sig_label = get_label(signature, schemas)
    let entities = []
    for (const entity of signature.data) {
      const ent = get_label(entity, schemas)
      entities = [...entities, ent]
    }
    dataset = [...dataset, `${sig_label}\t\t${entities.join('\t')}`]
  }
  NProgress.done()
  fileDownload(dataset.join('\n'), `${filename}.gmt`)
}


export async function download_library_tsv(item, schemas = undefined, provider = undefined) {
  NProgress.start()
  if (schemas === undefined) schemas = await fetch_schemas()
  if (provider === undefined) provider = new DataProvider()
  const library = await get_library({ item,
    provider,
    schemas,
    opts: {
      resource: false,
      library: true,
      signatures: true,
      data: true,
      validator: true,
    },
  })

  const filename = get_label(library, schemas)

  const dataset = {}
  for (const signature of library.signatures) {
    const sig_label = get_label(signature, schemas)
    let entities = []
    for (const entity of signature.data) {
      const ent = get_label(entity, schemas)
      entities = [...entities, ent]
    }
    dataset[sig_label] = entities
  }

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
    
    }
    const nonmember = Object.keys(acc).filter((ent) => (dataset[sig].indexOf(ent) === -1))
    for (const entity of nonmember) {
      acc[entity] = `${acc[entity]}\t0`
    
    }
    columns = [...columns, sig]
    return (acc)
  }, {})
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
  let result = ''
  for (const col_label of col_labels) {
    result += `${'\t'.repeat(row_labels.length)}\t${col_headers[col_label].join('\t')}\n`
  }
  result += `${row_labels.join('\t')}\t${'\t'.repeat(signatures.length)}\n`
  for (const row of row_headers) {
    result += `${row_labels.map((row_label) => row[row_label]).join('\t')}\t${'1'.repeat(row.length)}\n`
  }

  fileDownload(result, 'data.tsv')
}
