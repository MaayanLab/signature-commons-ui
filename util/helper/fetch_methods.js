import { Set } from 'immutable'
import { fetch_meta_post, fetch_meta } from '../fetch/meta'
import { fetch_data } from '../fetch/data'
import { get_library_resources } from './resources'
import { makeTemplate, makeTemplateForObject } from '../makeTemplate'
import { maybe_fix_obj, parse_entities } from './misc'
import { objectMatch } from '../objectMatch'
import isUUID from 'validator/lib/isUUID'
import { fetch_count } from './server_side'
import { findMatchedSchema } from '../objectMatch'
import merge from 'deepmerge'

export const operationIds = {
  libraries: {
    count: 'Library.count',
    find: 'Library.find',
    value_count: 'Library.value_count',
  },
  signatures: {
    count: 'Signature.count',
    find: 'Signature.find',
    value_count: 'Signature.value_count',
  },
}

export const get_key_count = async (tables) => {
  const key_counts = {}
  for (const table of tables) {
    const { response: key_count } = await fetch_meta({
      endpoint: `/${table}/key_count`,
    })
    key_counts[table] = key_count
  }
  return { key_count: key_counts }
}

export const get_summary_statistics = async () => {
  const { response: serverSideProps } = await fetch_meta({
    endpoint: '/summary',
  })
  if (serverSideProps.length === 0) {
    return { serverSideProps: {
      barcounts: {},
      barscores: {},
      histograms: {},
      meta_counts: [],
      pie_counts: {},
      resource_signature_count: [],
      schemas: [],
      table_counts: [],
      word_count: [],
    },
    }
  }
  if (serverSideProps.table_counts === undefined) serverSideProps.table_counts = []
  const { response: resources } = await fetch_meta({
    endpoint: '/resources',
  })
  
  const resource_mapper = {}
  for (const r of resources) {
    resource_mapper[r.id] = r
  }

  const { resource_signature_count: response } = serverSideProps
  let schemas = serverSideProps.schemas
  if (schemas.length === 0){
    const { response } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': {
              like: '%/meta/schema/ui-schema.json%',
            },
          },
        },
      },
    })
    schemas = response.map(i=>i.meta)
  }
      
  if (response.length > 0) {
    const resource_signature_count = []
    for (const r of response) {
      const { count, id } = r
      const resource = resource_mapper[id]
      if (resource !== undefined) {
        const schema = findMatchedSchema(resource, schemas)
        let name
        if (schema !== null) {
          const name_props = Object.values(schema.properties).filter((prop) => prop.name)
          if (name_props.length > 0) {
            name = makeTemplate(name_props[0].text, resource)
          }
          if (name_props.length === 0 || name === 'undefined') {
            console.warn('source of resource name is not defined, using either Resource_Name or ids')
            name = resource.meta['Resource_Name'] || id
          }
        } else {
          console.warn('source of resource name is not defined, using either Resource_Name or ids')
          name = resource.meta['Resource_Name'] || id
        }
        resource_signature_count.push({ name, id, counts: count })
      }
    }
    return { serverSideProps: {
      ...serverSideProps,
      resource_signature_count,
    } }
  } else {
    return { serverSideProps }
  }
}


export const resolve_entities = async (props) => {
  /**
   * Entities are formatted like this
   * [
   *  {
   *    label: "MCF10A",
   *    type: "valid" || "suggestions" || "invalid" || "loading",
   *    id: <uuid if valid, else, integer>
   *  }
   * ]
   */
  // Sort out unprocessed and processed entities
  const { entity_strategy, synonym_strategy } = props
  let unprocessed_entities_names = Set([])
  let processed_entities_names = Set([])
  const processed_entities = []
  for (const e of props.entities) {
    if (e.type === 'loading') unprocessed_entities_names = unprocessed_entities_names.add(e.label)
    else {
      processed_entities.push(e)
      processed_entities_names = processed_entities_names.add(e.label)
    }
  }
  if (processed_entities.length === props.entities.length) {
    return { entities: props.entities }
  }
  // Get schemas
  const schemas = (await get_schemas()).filter((schema) => schema.type === 'entity')

  // Get fields labeled as name
  let name_props = []
  for (const schema of schemas) {
    const name_prop = Object.values(schema.properties).filter((prop) =>
      prop.name &&
      prop.field !== undefined)
    name_props = [...name_props, ...name_prop]
  }

  // Get fields labeled as signature
  let synonyms_props = []
  for (const schema of schemas) {
    const synonyms_prop = Object.values(schema.properties).filter((prop) =>
      prop.synonyms &&
      prop.field !== undefined)
    synonyms_props = [...synonyms_props, ...synonyms_prop]
  }

  // Process the query, we will or a list of name_prop: {inq: [...entities]}
  // parse_entities parses the entities and transform it to upper or lower case depending on the strategy
  const parsed_entities = parse_entities(unprocessed_entities_names.toArray(), entity_strategy)
  const or_name_query = name_props.map((prop) => {
    return ({
      [prop.field]: {
        inq: Object.keys(parsed_entities),
      },
    })
  })

  //  Query names
  const { duration: duration_name, response: entity_name_meta_pre } = await fetch_meta_post({
    endpoint: '/entities/find',
    body: {
      filter: {
        where: {
          or: or_name_query,
        },
      },
    },
    signal: props.controller.signal,
  })

  // Move all unprocessed with matched names to processd
  const entity_name_meta = maybe_fix_obj(entity_name_meta_pre)
  for (const entity of Object.values(entity_name_meta)) {
    const sch = findMatchedSchema(entity, schemas)
    const n_props = Object.values(sch.properties).filter((prop) =>
      prop.name &&
      prop.field !== undefined)
    for (const name_prop of n_props) {
      const label = makeTemplate(name_prop.text, entity)
      const original_label = parsed_entities[label]
      if (label !== 'undefined' && unprocessed_entities_names.has(original_label)) {
        processed_entities.push({
          label,
          type: 'valid',
          ...entity,
        })
        processed_entities_names = processed_entities_names.add(label)
        unprocessed_entities_names = unprocessed_entities_names.delete(original_label)
        break
      }
    }
  }

  // Format the synonyms query, we will or a list of name_prop: {inq: [...entities]}
  // parse_entities parses the entities and transform it to upper or lower case depending on the strategy
  const parsed_entities_for_synonyms = parse_entities(unprocessed_entities_names.toArray(), synonym_strategy)

  let or_synonym_query = []
  for (const prop of synonyms_props) {
    const subquery = Object.keys(parsed_entities_for_synonyms).map((name) => ({
      [prop.field]: name,
    }))
    or_synonym_query = [...or_synonym_query, ...subquery]
  }


  // Query for synonyms
  let entity_synonym_meta = {}
  if (or_synonym_query.length > 0) {
    const { duration: duration_synonym, response: entity_synonym_meta_pre } = await fetch_meta_post({
      endpoint: '/entities/find',
      body: {
        filter: {
          where: {
            or: or_synonym_query,
          },
        },
      },
      signal: props.controller.signal,
    })
    entity_synonym_meta = maybe_fix_obj(entity_synonym_meta_pre || [])
  }

  // Process synonyms
  const with_synonyms_meta = {}
  for (const entity of Object.values(entity_synonym_meta)) {
    let syn_names = Set([])
    const sch = findMatchedSchema(entity, schemas)
    const n_props = Object.values(sch.properties).filter((prop) =>
      prop.name &&
      prop.field !== undefined)
    const s_props = Object.values(sch.properties).filter((prop) =>
      prop.synonyms &&
      prop.field !== undefined)
    for (const name_prop of n_props) {
      const label = makeTemplate(name_prop.text, entity)
      if (label !== 'undefined') syn_names = syn_names.add(label)
    }
    syn_names = syn_names.toArray()
    for (const synonym_prop of s_props) {
      if (synonym_prop.type === 'object') {
        const synonyms = Set(makeTemplateForObject('${JSON.stringify(' + synonym_prop.field + ')}', entity))
            .intersect(Set(Object.keys(parsed_entities_for_synonyms)))
            .map((syn) => {
              const original_label = parsed_entities_for_synonyms[syn]
              if (with_synonyms_meta[original_label] === undefined) {
                with_synonyms_meta[original_label] = {
                  label: syn,
                  type: 'suggestions',
                  id: syn,
                  suggestions: [],
                }
              }
              for (const label of syn_names) {
                with_synonyms_meta[original_label].suggestions.push(
                    {
                      label,
                      type: 'valid',
                      ...entity,
                    }
                )
              }
              return syn
            })
      } else if (synonym_prop.type === 'text') {
        const syn = makeTemplate(synonym_prop.text, entity)
        if (Object.keys(parsed_entities_for_synonyms).indexOf(syn) > -1) {
          const original_label = parsed_entities_for_synonyms[syn]
          if (with_synonyms_meta[original_label] === undefined) {
            with_synonyms_meta[original_label] = {
              label: syn,
              type: 'suggestions',
              id: syn,
              suggestions: [],
            }
          }
          for (const label of syn_names) {
            with_synonyms_meta[original_label].suggestions.push(
                {
                  label,
                  type: 'valid',
                  ...entity,
                }
            )
          }
        }
      }
    }
  }

  // Get those with no matches
  const invalid = unprocessed_entities_names.subtract(Set(Object.keys(with_synonyms_meta)))
      .map((label) => ({
        label,
        type: 'invalid',
        id: label,
      }))
  return { entities: [...Object.values(with_synonyms_meta),
    ...invalid,
    ...processed_entities],
  }
}

// export async function resolve_entities_1(props) {
//   let entities = Set([...props.entities])
//   const entitiy_ids = {}
//   // Get fields from schema
//   const sch= await get_schemas()
//   const schemas = sch.filter(schema=>schema.type==="entity")

//   // const matched_schemas = schemas.filter(
//   //     (schema) => objectMatch(schema.match, entity[0])
//   // )
//   // if (matched_schemas.length === 0) {
//   //   console.error('No matchcing schema for', entity[0])
//   // }
//   let name_props = []
//   for (const schema of schemas){
//     const name_prop = Object.values(schema.properties).filter((prop) =>
//       prop.name &&
//       prop.field !== undefined)
//     name_props = [...name_props, ...name_prop]
//   }

//   let entity_names = []
//   const or = name_props.map((prop) => {
//     entity_names = [...entity_names, prop.field]
//     return ({
//       [prop.field]: {
//         inq: entities.toArray(),
//       },
//     })
//   })
//   const { duration, response: entity_meta_pre } = await fetch_meta_post({
//     endpoint: '/entities/find',
//     body: {
//       filter: {
//         fields: ["id", ...name_props.map(p=>p.field)],
//         where: {
//           or,
//         },
//       },
//     },
//     signal: props.controller.signal,
//   })
//   const entity_meta = maybe_fix_obj(entity_meta_pre)
//   for (const entity of Object.values(entity_meta)) {
//     const names = name_props.map((prop) => makeTemplate(prop.text, entity))
//     let name
//     if (names.length > 0) {
//       name = names.filter(n=>n!=="null")
//       if (name.length===0){
//         name="null"
//       }else{
//         name=name[0]
//       }
//     } else {
//       console.error('Cannot find a name for', entity)
//     }
//     const matched_entities = entities.intersect(
//         Set([name])
//     )

//     if (matched_entities.count() > 0) {
//       entities = entities.subtract(matched_entities)
//       for (const matched_entity of matched_entities) {
//         entitiy_ids[matched_entity] = entity
//       }
//       if (matched_entities.count() > 1) {
//         console.warn(entity, 'matched', [...matched_entities])
//       }
//     }
//   }

//   return {
//     matched: entitiy_ids,
//     mismatched: entities,
//     duration,
//   }
// }


export async function get_schemas() {
  const { response: schema_db } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': {
            like: '%/meta/schema/ui-schema.json%',
          },
        },
      },
    },
  })
  const schemas = schema_db.map((schema) => (schema.meta))
  return schemas
}

export async function query_overlap(props) {
  let { input,
    libraries,
    library_resource,
    schemas,
    schema_validator,
  } = props

  const start = Date.now()

  let duration_data = 0
  let count_data = 0

  if (libraries === undefined || library_resource === undefined) {
    const { libraries: l, library_resource: lr } = await get_library_resources({ schema_validator, schemas })
    libraries = l
    library_resource = lr
  }
  const resolve_entities = input.entities.map((e) => {
    const { label, type, ...entity } = e
    return entity
  })


  // fix input fields uuid -> id
  const entity_meta = maybe_fix_obj(resolve_entities)
  // get entities
  const entities = resolve_entities.map((entity) => entity.id)
  // Get all supported dataset type in the data api
  const { response } = await fetch_data({ endpoint: '/listdata' })
  // Get enriched results (Note: we are only using geneset_library datasets)
  const enriched_results_geneset = (await Promise.all(
      response.repositories.filter((repo) => repo.datatype === 'geneset_library').map((repo) =>
        fetch_data({
          endpoint: '/enrich/overlap',
          body: {
            entities: entities,
            signatures: [],
            database: repo.uuid,
            limit: 500,
          },
          signal: props.controller.signal,
        })
      )
  )).reduce(
      (results, res) => {
        const { duration: duration_data_n, contentRange: contentRange_data_n, response: result } = res
        duration_data += duration_data_n
        count_data += (contentRange_data_n || {}).count || 0

        return ({
          ...results,
          ...maybe_fix_obj(result.results),
        })
      }, {}
  )
  const enriched_results_rank = (await Promise.all(
      response.repositories.filter((repo) => repo.datatype === 'rank_matrix').map((repo) =>
        fetch_data({
          endpoint: '/enrich/rank',
          body: {
            entities: entities,
            signatures: [],
            database: repo.uuid,
            limit: 500,
          },
          signal: props.controller.signal,
        })
      )
  )).reduce(
      (results, res) => {
        const { duration: duration_data_n, contentRange: contentRange_data_n, response: result } = res
        duration_data += duration_data_n
        count_data += (contentRange_data_n || {}).count || 0

        return ({
          ...results,
          ...maybe_fix_obj(result.results),
        })
      }, {}
  )
  const enriched_results = merge.all([enriched_results_geneset, enriched_results_rank])
  // Get metadata of matched signatures
  const { duration: duration_meta, response: enriched_signatures_meta } = await fetch_meta_post({
    endpoint: '/signatures/find',
    body: {
      filter: {
        where: {
          id: {
            inq: Object.values(enriched_results).map((k) => k.id),
          },
        },
      },
    },
    signal: props.controller.signal,
  })

  // Join signature metadata, and the overlaps
  const enriched_signatures = enriched_signatures_meta.reduce(
      (full, signature) => ([
        ...full,
        {
          ...signature,
          meta: {
            ...signature.meta,
            ...{
              ...enriched_results[signature.id],
              ...(enriched_results[signature.id].overlap === undefined ? {} : {
                overlap: enriched_results[signature.id].overlap.map((id) => ({
                  '@id': id,
                  '@type': 'Entity',
                  'meta': entity_meta[id].meta,
                })),
              }),
            },
          },
        },
      ]), []
  )

  // Group results based on library and resources
  const resource_signatures = {}
  const library_signatures = {}
  for (const sig of enriched_signatures) {
    if (library_signatures[sig.library] === undefined) {
      library_signatures[sig.library] = {
        library: libraries[sig.library],
        signatures: [],
      }
    }
    // library_signatures[sig.library].signatures.push({
    //   ...sig,
    //   library: libraries[sig.library],
    // })
    library_signatures[sig.library].signatures.push({
      ...sig,
      library: libraries[sig.library],
    })
    const resource = library_resource[sig.library]
    if (resource_signatures[resource] === undefined) {
      resource_signatures[resource] = {
        libraries: Set(),
        count: 0,
      }
    }
    resource_signatures[resource] = {
      ...resource_signatures[resource],
      libraries: resource_signatures[resource].libraries.add(sig.library),
      count: resource_signatures[resource].count + 1,
    }
  }
  return {
    library_signatures,
    resource_signatures,
    count: Object.keys(enriched_results).length,
    count_data,
    duration_data: duration_data,
    duration: (Date.now() - start) / 1000,
    duration_meta: duration_meta,
    controller: null,
  }
}

export async function query_rank(props) {
  let { input,
    libraries,
    library_resource,
    schemas,
    schema_validator,
  } = props

  const start = Date.now()

  let duration_data = 0
  let count_data = 0

  if (libraries === undefined || library_resource === undefined) {
    const { libraries: l, library_resource: lr } = await get_library_resources({ schema_validator, schemas })
    libraries = l
    library_resource = lr
  }
  const resolved_up_entities = Object.keys(input.up_entities).map((entity) => input.up_entities[entity])
  const resolved_down_entities = Object.keys(input.down_entities).map((entity) => input.down_entities[entity])

  const entity_meta = {
    ...maybe_fix_obj(resolved_up_entities),
    ...maybe_fix_obj(resolved_down_entities),
  }
  const up_entities = resolved_up_entities.map((entity) => entity.id)
  const down_entities = resolved_down_entities.map((entity) => entity.id)

  const { response } = await fetch_data({ endpoint: '/listdata' })

  const enriched_results = (await Promise.all(
      response.repositories.filter((repo) => repo.datatype === 'rank_matrix').map(async (repo) => {
        try {
          return await fetch_data({
            endpoint: '/enrich/ranktwosided',
            body: {
              up_entities: up_entities,
              down_entities: down_entities,
              signatures: [],
              database: repo.uuid,
              limit: 500,
            },
            signal: props.controller.signal,
          })
        } catch (error) {
          return null
        }
      })
  )).filter((val) => val !== null).reduce(
      (results, { duration: duration_data_n, contentRange: contentRange_data_n, response: result }) => {
        duration_data += duration_data_n
        count_data += (contentRange_data_n || {}).count || 0
        if (Object.keys(result.results).length === 0) {
          return (results)
        }
        return ({
          ...results,
          ...maybe_fix_obj(
              result.results.reduce(
                  (results, result) =>
              result['p-up'] < 0.05 && result['p-down'] <= 0.05 ? [
                ...results,
                ({
                  ...result,
                  id: result.signature,
                }),
              ] : results,
                  []
              ).sort(
                  (a, b) => (a['p-up'] - b['p-up']) + (a['p-down'] - b['p-down'])
              ).slice(0, 1000)
          ),
        })
      }, {}
  )
  const { duration: duration_meta, response: enriched_signatures_meta } = await fetch_meta_post({
    endpoint: '/signatures/find',
    body: {
      filter: {
        where: {
          id: {
            inq: Object.values(enriched_results).map((k) => k.id),
          },
        },
      },
    },
    signal: props.controller.signal,
  })

  const enriched_signatures = enriched_signatures_meta.reduce(
      (full, signature) => ([
        ...full,
        {
          ...signature,
          meta: {
            ...signature.meta,
            ...{
              ...enriched_results[signature.id],
              ...(enriched_results[signature.id].overlap === undefined ? {} : {
                overlap: enriched_results[signature.id].overlap.map((id) => ({
                  '@id': id,
                  '@type': 'Entity',
                  'meta': entity_meta[id].meta,
                })),
              }),
            },
          },
        },
      ]), []
  )
  const resource_signatures = {}
  const library_signatures = {}
  for (const sig of enriched_signatures) {
    if (library_signatures[sig.library] === undefined) {
      library_signatures[sig.library] = {
        library: libraries[sig.library],
        signatures: [],
      }
    }
    // library_signatures[sig.library].signatures.push({
    //   ...sig,
    //   library: libraries[sig.library],
    // })
    library_signatures[sig.library].signatures.push({
      ...sig,
      library: libraries[sig.library],
    })

    const resource = library_resource[sig.library]
    if (resource_signatures[resource] === undefined) {
      resource_signatures[resource] = {
        libraries: Set(),
        count: 0,
      }
    }
    resource_signatures[resource] = {
      ...resource_signatures[resource],
      libraries: resource_signatures[resource].libraries.add(sig.library),
      count: resource_signatures[resource].count + 1,
    }
  }
  return {
    library_signatures,
    resource_signatures,
    count: Object.keys(enriched_results).length,
    count_data,
    duration_data: duration_data,
    duration: (Date.now() - start) / 1000,
    duration_meta: duration_meta,
    controller: null,
  }
}
