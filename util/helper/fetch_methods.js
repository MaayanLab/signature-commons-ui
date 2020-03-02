import { Set } from 'immutable'
import { fetch_meta_post, fetch_meta } from '../fetch/meta'
import { fetch_data } from '../fetch/data'
import { get_library_resources } from './resources'
import { makeTemplate } from '../makeTemplate'
import { maybe_fix_obj } from './misc'
import { objectMatch } from '../objectMatch'
import isUUID from 'validator/lib/isUUID'
import { fetch_count } from './server_side'
import { findMatchedSchema } from '../objectMatch'

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

export const get_summary_statistics = async () => {
  const {response: serverSideProps} = await fetch_meta({
    endpoint: "/summary"
  })
  if (serverSideProps.length === 0){
    return { serverSideProps: {
        barcounts: {},
        barscores: {},
        histograms: {},
        meta_counts: [],
        pie_counts: {},
        resource_signature_count: [],
        schemas: [],
        table_counts: [],
        word_count: []
      }
    }
  }
  if (serverSideProps.table_counts === undefined) serverSideProps.table_counts = []
  const {response: resources} = await fetch_meta({
    endpoint: "/resources"
  })
  const resource_mapper = {}
  for (const r of resources){
    resource_mapper[r.id] = r
  }

  const {resource_signature_count: response, schemas} = serverSideProps
  if (response.length > 0){
    const resource_signature_count = []
    for (const r of response){
      const {count, id} = r
      const resource = resource_mapper[id]
      if (resource!==undefined){
        const schema = findMatchedSchema(resource, schemas)
        let name
        if (schema!==null){
          const name_props = Object.values(schema.properties).filter((prop) => prop.name)
          if (name_props.length > 0) {
            name = makeTemplate(name_props[0].text, resource)
          } 
          if (name_props.length===0 || name === 'undefined') {
            console.warn('source of resource name is not defined, using either Resource_Name or ids')
            name = resource.meta['Resource_Name'] || id
          }
        }else {
          console.warn('source of resource name is not defined, using either Resource_Name or ids')
          name = resource.meta['Resource_Name'] || id
        }
        resource_signature_count.push({name, id, counts: count})
      }
    }
    return { serverSideProps: {
      ...serverSideProps,
      resource_signature_count
    } }
  }else {
    return { serverSideProps }
  }
}

export const fetch_all_as_dictionary = async ({ table, controller }) => {
  const count = await fetch_count(table)
  if (count === 0) return null

  const { response: meta } = await fetch_meta({
    endpoint: `/${table}`,
    signal: controller.signal,
  })
  const meta_dict = meta.reduce((acc, item) => {
    acc = {
      ...acc,
      [item.id]: item,
    }
    return acc
  }, {})
  return meta_dict
}

export function build_where({ search, parent, filters }) {
  const where = {}
  let andClauses = []
  let orClauses = []

  for (const q of search) {
    if (isUUID(q) || isUUID(q.substring(1).trim()) || isUUID(q.substring(3).trim())) {
      if (q.startsWith('!') || q.startsWith('-')) {
        // and not
        andClauses = [...andClauses, { id: q.substring(1) }]
      } else if (q.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { id: q.substring(3) }]
      } else if (q.startsWith('|')) {
        orClauses = [...orClauses, { id: q.substring(1) }]
      } else {
        // and
        andClauses = [...andClauses, { id: q.substring(1) }]
      }
    } else if (q.indexOf(':') !== -1) {
      const [key, ...value] = q.split(':')
      if (key.startsWith('!') || key.startsWith('-')) {
        andClauses = [...andClauses, { ['meta.' + key.substring(1).trim()]: { nilike: '%' + value.join(':') + '%' } }]
      } else if (key.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { ['meta.' + key.substring(3).trim()]: { ilike: '%' + value.join(':') + '%' } }]
      } else if (key.startsWith('|')) {
        orClauses = [...orClauses, { ['meta.' + key.substring(1).trim()]: { ilike: '%' + value.join(':') + '%' } }]
      } else {
        andClauses = [...andClauses, { ['meta.' + key.trim()]: { ilike: '%' + value.join(':') + '%' } }]
      }
    } else {
      // full text query
      if (q.startsWith('!') || q.startsWith('-')) {
        // and not
        andClauses = [...andClauses, { meta: { fullTextSearch: { ne: q.substring(1).trim() } } }]
      } else if (q.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(3).trim() } } }]
      } else if (q.startsWith('|')) {
        orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(1).trim() } } }]
      } else {
        // and
        andClauses = [...andClauses, { meta: { fullTextSearch: { eq: q.trim() } } }]
      }
    }
  }
  if (orClauses.length > 0) {
    if (andClauses.length > 0) {
      orClauses = [...orClauses, { and: andClauses }]
    }
    where['or'] = orClauses
  } else {
    where['and'] = andClauses
  }

  if (filters !== undefined) {
    if (where.and === undefined) {
      where = {
        and: [...where],
      }
    }
    for (const [filter, values] of Object.entries(filters)) {
      if (filter === parent) {
        where = {
          and: [...where.and, { inq: [...values] }],
        }
      }
    }
  }

  return where
}

export const format_bulk_param_search = ({
  operationId,
  parent,
  parent_ids,
  value_count,
  filters,
  search,
  where,
  limit,
  skip,
  fields,
  global_count,
  parent_count,
  ...props
}) => {
  if (limit === undefined) limit = 10
  if (where === undefined && search !== undefined) where = build_where({ search, parent, filters })
  if (where === undefined && search === undefined) where = {}
  if (global_count === undefined) global_count = true
  let params = []

  if (operationId.includes('.find')) {
    params = [...params,
      {
        operationId,
        parameters: {
          filter: {
            where,
            limit,
            skip,
          },
        },
      },
    ]
  } else if (operationId.includes('.value_count') && fields !== undefined) {
    params = [...params,
      {
        operationId,
        parameters: {
          filter: {
            where,
            fields,
          },
        },
      },
    ]
  } else if (operationId.includes('.count')) {
    if (global_count) {
      // Always true when counting
      params = [...params,
        {
          operationId,
          parameters: {
            where,
          },
        },
      ]
    }
    // count per parent
    if (parent_count) {
      if (where.and === undefined) {
        where = {
          and: [...where],
        }
      }
      let p = parent_ids
      if (filters !== undefined) {
        p = filters[parent] || parent_ids
      }
      const plist = p.map((pid) => ({
        operationId,
        parameters: {
          where: {
            and: [...where.and,
              { [parent]: pid },
            ],
          },
        },
      }))
      params = [...params, ...plist]
    }
  }

  return params
}

// {
//   query: {
//     search: [],
//     filters,
//     limit,
//     skip
//   },
//   aggregate: {
//     count: {
//      parent_count: true,
//      global_count: true
//    },
//     value_count: {
//        fields: []
//     }
//   }
// }
export const fetch_metadata = async ({
  table,
  search_params,
  parent,
  parent_ids,
  controller,
  ...props
}) => {
  const { query, aggregate } = search_params

  let bulk_params = []
  if (query !== undefined) {
    const operationId = operationIds[table].find
    const query_params = format_bulk_param_search({ operationId, parent, parent_ids, ...query })
    bulk_params = [...bulk_params, ...query_params]
  }
  if (aggregate !== undefined) {
    const { count, value_count } = aggregate
    const operationId = operationIds[table].value_count
    if (value_count !== undefined) {
      const value_count_params = format_bulk_param_search({ operationId, parent, parent_ids, ...query, ...value_count })
      bulk_params = [...bulk_params, ...value_count_params]
    }
    if (count !== undefined) {
      const operationId = operationIds[table].count
      const count_params = format_bulk_param_search({ operationId, parent, parent_ids, ...query, ...count })
      bulk_params = [...bulk_params, ...count_params]
    }
  }
  // Fetch
  let { response: bulk_response } = await fetch_meta_post({
    endpoint: '/bulk',
    body: bulk_params,
    signal: controller.signal,
  })

  // Process Data
  // Order
  // [
  //   {Metadata_Result},
  //   {value_count},
  //   {count},
  //   {count_per_parent}
  // ]
  let metadata_search_result = { table }
  if (query !== undefined) {
    const [matches, ...rest] = bulk_response
    metadata_search_result = {
      ...metadata_search_result,
      matches: matches.response,
    }
    bulk_response = rest
  }
  if (aggregate !== undefined) {
    const { count, value_count } = aggregate
    if (value_count !== undefined) {
      const [value_count, ...rest] = bulk_response
      metadata_search_result = {
        ...metadata_search_result,
        value_count: value_count.response,
      }
      bulk_response = rest
    }
    if (count !== undefined) {
      const { global_count, parent_count } = count
      if (global_count) {
        const [c, ...rest] = bulk_response
        metadata_search_result = {
          ...metadata_search_result,
          count: c.response.count,
        }
        bulk_response = rest
      }
      if (parent_count) {
        const c = bulk_response
        const count_per_parent = c.map((c, ind) => {
          const parent_id = parent_ids[ind]
          const { response: count } = c
          return { parent_id, count }
        }).reduce((acc, item) => ({
          ...acc,
          [item.parent_id]: item.count,
        }), {})
        metadata_search_result = {
          ...metadata_search_result,
          count_per_parent,
        }
      }
    }
  }

  return metadata_search_result
}


// operationId: see sigcom-api
// filter: filter to use
// parent: parent of the table in hierarchy i.e resource -> library -> signature
// parent_ids: available ids
// params: other params
// controller: abort controller
export async function fetch_bulk_counts_per_parent({ table,
  operationId,
  parent,
  parent_ids,
  filters,
  controller,
  search,
  ...props }) {
  const bulk_params = format_bulk_metadata_search_count_per_parent({ operationId,
    parent,
    parent_ids,
    filters,
    controller,
    search,
  })
  const { response: bulk_counts } = await fetch_meta_post({
    endpoint: '/bulk',
    body: bulk_params,
    signal: controller.signal,
  })
  let count = 0
  const count_per_parent = bulk_counts.map((c, ind) => {
    const parent_id = parent_ids[ind]
    const { response: percount } = c
    count = count + percount.count
    return { parent_id, count: percount }
  }).reduce((acc, item) => ({
    ...acc,
    [item.parent_id]: item.count,
  }), {})
  return { table, count, count_per_parent }
}

export async function metadataSearcher({ search,
  table,
  parent,
  parents_meta,
  where,
  search_filters,
  controller }) {
  let { limit, skip, filters } = search_filters
  if (limit === undefined) limit = 10
  if (where === undefined && search !== undefined) where = build_where(search)
  if (where === undefined && search === undefined) where = {}

  if (filters !== undefined) {
    for (const [key, val] of Object.entries(filters)) {
      if (where.and !== undefined) {
        where = {
          and: [
            ...where.and,
            {
              [key]: {
                'inq': val,
              },
            },
          ],
        }
      } else {
        where = {
          and: [
            ...where,
            {
              [key]: {
                'inq': val,
              },
            },
          ],
        }
      }
    }
  }
  let { response: matches, contentRange, duration } = await fetch_meta_post({
    endpoint: `/${table}/find`,
    body: {
      filter: {
        where,
        limit,
        skip,
      },
    },
    signal: controller.signal,
  })
  matches = matches.map((m) => {
    const parent_name = parent === 'id' ? 'resource' : parent
    m[parent_name] = parents_meta[m[parent_name]]
    return m
  })
  return { table, matches, count: contentRange.count, duration }
}

export async function resolve_entities(props) {
  let entities = Set([...props.entities])
  const entitiy_ids = {}
  // Get fields from schema
  const sch= await get_schemas()
  const schemas = sch.filter(schema=>schema.type==="entity")
  
  // const matched_schemas = schemas.filter(
  //     (schema) => objectMatch(schema.match, entity[0])
  // )
  // if (matched_schemas.length === 0) {
  //   console.error('No matchcing schema for', entity[0])
  // }
  let name_props = []
  for (const schema of schemas){
    const name_prop = Object.values(schema.properties).filter((prop) =>
      prop.name &&
      prop.field !== undefined)
    name_props = [...name_props, ...name_prop]
  }
  
  let entity_names = []
  const or = name_props.map((prop) => {
    entity_names = [...entity_names, prop.field]
    return ({
      [prop.field]: {
        inq: entities.toArray(),
      },
    })
  })
  const { duration, response: entity_meta_pre } = await fetch_meta_post({
    endpoint: '/entities/find',
    body: {
      filter: {
        fields: ["id", ...name_props.map(p=>p.field)],
        where: {
          or,
        },
      },
    },
    signal: props.controller.signal,
  })
  const entity_meta = maybe_fix_obj(entity_meta_pre)
  for (const entity of Object.values(entity_meta)) {
    const names = name_props.map((prop) => makeTemplate(prop.text, entity))
    let name
    if (names.length > 0) {
      name = names.filter(n=>n!=="null")
      if (name.length===0){
        name="null"
      }else{
        name=name[0]
      }
    } else {
      console.error('Cannot find a name for', entity)
    }
    const matched_entities = entities.intersect(
        Set([name])
    )

    if (matched_entities.count() > 0) {
      entities = entities.subtract(matched_entities)
      for (const matched_entity of matched_entities) {
        entitiy_ids[matched_entity] = entity
      }
      if (matched_entities.count() > 1) {
        console.warn(entity, 'matched', [...matched_entities])
      }
    }
  }

  return {
    matched: entitiy_ids,
    mismatched: entities,
    duration,
  }
}

export async function find_synonyms(props) {
  const schemas = await get_schemas()
  const { response: entity } = await fetch_meta_post({
    endpoint: `/entities/find`,
    body: {
      filter: {
        limit: 1,
      },
    },
    signal: props.controller.signal,
  })
  const matched_schemas = schemas.filter(
      (schema) => objectMatch(schema.match, entity[0])
  )
  if (matched_schemas.length === 0) {
    console.error('No matchcing schema')
  }
  const name_props = Object.keys(matched_schemas[0].properties).filter((prop) =>
    matched_schemas[0].properties[prop].name &&
    matched_schemas[0].properties[prop].field !== undefined)

  const synonym_props = Object.keys(matched_schemas[0].properties).filter((prop) =>
    matched_schemas[0].properties[prop].synonyms &&
    matched_schemas[0].properties[prop].field !== undefined)

  let entity_names = []
  const or = name_props.map((prop) => {
    entity_names = [...entity_names, prop.field]
    return ({
      [prop.field]: {
        inq: entities.toArray(),
      },
    })
  })
  if (entity_synonyms === undefined || entity_synonyms.length === 0) {
    return { term: props.term, synonyms: {} }
  }
  const { response: syns } = await fetch_meta_post({
    endpoint: '/entities/find',
    body: {
      filter: {
        where: {
          or,
        },
        fields: [
          'id',
          ...entity_names,
        ],
      },
    },
    signal: props.controller.signal,
  })
  const synonyms = syns.map((s) => {
    const ent_names = name_props.map((prop) => {
      try {
        const name = makeTemplate(prop.text, s)
        return (name)
      } catch (error) {
        return 'undefined'
      }
    }).filter((n) => n !== 'undefined')
    if (ent_names.length === 0) {
      return {}
    }
    return { name: ent_names[0], val: s }
  }).filter((item) => item.name !== undefined).reduce((acc, item) => ({
    ...acc,
    [item.name]: item.val,
  }), {})
  return { term: props.term, synonyms }
}

export async function get_schemas(schema_validator) {
  const { response: schema_db } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': schema_validator || '/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json',
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
  const resolve_entities = Object.keys(input.entities).map((entity) => input.entities[entity])


  // fix input fields uuid -> id
  const entity_meta = maybe_fix_obj(resolve_entities)
  // get entities
  const entities = resolve_entities.map((entity) => entity.id)
  // Get all supported dataset type in the data api
  const { response } = await fetch_data({ endpoint: '/listdata' })
  // Get enriched results (Note: we are only using geneset_library datasets)
  const enriched_results = (await Promise.all(
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
  )).filter(val=>val!==null).reduce(
      (results, { duration: duration_data_n, contentRange: contentRange_data_n, response: result }) => {
        duration_data += duration_data_n
        count_data += (contentRange_data_n || {}).count || 0
        if(Object.keys(result.results).length === 0){
          return(results)
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
