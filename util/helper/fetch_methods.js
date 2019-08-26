import { Set } from 'immutable'
import { fetch_meta_post, fetch_meta } from "../fetch/meta"
import { fetch_data } from "../fetch/data"
import { get_library_resources } from "./resources"
import { UIValues } from '../ui_values'
import { makeTemplate } from "../makeTemplate"

export function build_where(queries) {
  const where = {}
  let andClauses = []
  let orClauses = []

  for (const q of queries) {
    if (q.indexOf(':') !== -1) {
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
        andClauses = [...andClauses, { meta: { fullTextSearch: { ne: q.substring(1).trim().split(' ') } } }]
      } else if (q.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(3).trim().split(' ') } } }]
      } else if (q.startsWith('|')) {
        orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(1).trim().split(' ') } } }]
      } else {
        // and
        andClauses = [...andClauses, { meta: { fullTextSearch: { eq: q.trim().split(' ') } } }]
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
  return where
}

export async function search_signature_meta_per_library({library, controller, ...props}){
  let {limit, skip, search, where} = props
  if (limit===undefined) limit = 5
  if (where===undefined && search!==undefined) where = build_where([search])
  if (where===undefined && search===undefined) where = {}
  if (where.and !== undefined){
    where = {
      and: [
        ...where.and,
        {library: library}
      ]
    }
  } else {
    where = {
      and: [
        ...where,
        {library: library}
      ]
    }
  }
  const {response: signatures, contentRange, duration} = await fetch_meta_post({
    endpoint: `/signatures/find`,
    body: {
      filter: {
        where: {
          ...where,
          library: library.id,
        },
        limit,
        skip,
      },
    },
    signal: controller.signal,
  })
  if (signatures.length===0){
    return null
  }
  return {library, signatures, count: contentRange.count, duration}
}

export function parse_entities(input) {
  return Set(input.toUpperCase().split(/[ \t\r\n;]+/).reduce(
      (lines, line) => {
        const parsed = /^(.+?)(,(.+))?$/.exec(line)
        if (parsed !== null) {
          return [...lines, parsed[1]]
        }
        return lines
      }, []
  ))
}

export function maybe_fix_obj(obj) {
  if (Array.isArray(obj)) {
    return obj.reduce((objs, v) => {
      if (v.id !== undefined) {
        objs[v.id] = v
      } else if (v.uuid !== undefined) {
        objs[v.uuid] = v
        objs[v.uuid].id = v.uuid
        delete objs[v.uuid].uuid
      }
      return objs
    }, {})
  }
  return Object.keys(obj).reduce((objs, k) => ({ ...objs, [k]: { ...obj[k], id: k } }), {})
}

export async function resolve_entities(props) {
  let entities = Set([...props.entities])
  const entitiy_ids = {}
  // Get fields from schema
  let ui_values = props.ui_values
  if (ui_values === undefined){
    const { response: ui_val } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json',
            'meta.landing': true,
          },
        },
      },
    })
    const values = ui_val.length > 0 ? ui_val[0].meta.content : {}
    ui_values = UIValues['landing'](values)
  }
  const entity_names = ui_values.entity_name
  const or = entity_names.map(field=>({
      [field]: {
        inq: entities.toArray()
      }
    }))
  const { duration, response: entity_meta_pre } = await fetch_meta_post({
    endpoint: '/entities/find',
    body: {
      filter: {
        where: {
          or,
        },
        fields: [
          'id',
          ...entity_names
        ],
      },
    },
    signal: props.controller.signal,
  })
  const entity_meta = maybe_fix_obj(entity_meta_pre)

  for (const entity of Object.values(entity_meta)) {
    const matched_entities = entities.intersect(
        Set([entity.meta.Name])
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
  let ui_values = props.ui_values
  if (ui_values === undefined){
    const { response: ui_val } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json',
            'meta.landing': true,
          },
        },
      },
    })
    const values = ui_val.length > 0 ? ui_val[0].meta.content : {}
    ui_values = await UIValues['landing'](values)
  }
  const entity_names = ui_values.entity_name
  const entity_synonyms = ui_values.entity_synonyms
  const or = entity_synonyms.map(field=>({
      [field]: props.term
    }))
  if (entity_synonyms===undefined || entity_synonyms.length === 0){
    return { term: props.term, synonyms: {} }
  }
  const { duration, response: syns } = await fetch_meta_post({
    endpoint: '/entities/find',
    body: {
      filter: {
        where: {
          or
        },
        fields: [
          'id',
          ...entity_names,
        ],
      },
    },
    signal: props.controller.signal,
  })
  const synonyms = syns.map(s=>{
    const ent_names = entity_names.map(n=>{
      try{
        const property = '${'+ n +'}'
        const name = makeTemplate(property, s)
        return(name)
      }catch (error) {
        return 'undefined'
     }
    }).filter(n=>n!=="undefined")
    if (ent_names.length === 0){
      return {}
    }
    return {name: ent_names[0], val: s} 
  }).filter(item=>item.name!==undefined).reduce((acc,item)=>({
    ...acc,
    [item.name]: item.val,
  }),{})
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

export async function query_overlap(props){
  let { input,
    libraries,
    library_resource,
    schemas,
    schema_validator,
    controller
  } = props

  const start = Date.now()

  let duration_data = 0
  let count_data = 0

  if (libraries === undefined || library_resource === undefined){
    const {libraries: l, library_resource: lr} = await get_library_resources({schema_validator, schemas})
    libraries = l
    library_resource = lr
  }
  const resolve_entities = Object.keys(input.entities).map((entity)=>input.entities[entity])

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
      (results, { duration: duration_data_n, contentRange: contentRange_data_n, response: result }) => {
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
    controller
  } = props

  const start = Date.now()

  let duration_data = 0
  let count_data = 0

  if (libraries === undefined || library_resource === undefined){
    const {libraries: l, library_resource: lr} = await get_library_resources({schema_validator, schemas})
    libraries = l
    library_resource = lr
  }
  const resolved_up_entities = Object.keys(input.up_entities).map((entity)=>input.up_entities[entity])
  const resolved_down_entities = Object.keys(input.down_entities).map((entity)=>input.down_entities[entity])

  const entity_meta = {
    ...maybe_fix_obj(resolved_up_entities),
    ...maybe_fix_obj(resolved_down_entities),
  }
  const up_entities = resolved_up_entities.map((entity) => entity.id)
  const down_entities = resolved_down_entities.map((entity) => entity.id)

  const { response } = await fetch_data({ endpoint: '/listdata' })

  const enriched_results = (await Promise.all(
      response.repositories.filter((repo) => repo.datatype === 'rank_matrix').map((repo) =>
        fetch_data({
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
      )
  )).reduce(
      (results, { duration: duration_data_n, contentRange: contentRange_data_n, response: result }) => {
        duration_data += duration_data_n
        count_data += (contentRange_data_n || {}).count || 0
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

export async function metadataSearcher(props) {
  let { search,
    libraries,
    library_resource,
    schemas,
    schema_validator,
    controller,
    limit,
    skip,
  } = props
  const start = new Date()
  let duration_meta = 0
  let count_meta = 0

  if (libraries === undefined || library_resource === undefined){
    const {libraries: l, library_resource: lr} = await get_library_resources({schema_validator, schemas})
    libraries = l
    library_resource = lr
  }
  const where = build_where([search])
  const lib_sigs = await Promise.all(await Object.keys(libraries).map(async (library)=>{
    const res = await search_signature_meta_per_library({
      library,
      controller,
      where,
      search,
      limit,
      skip,
    })
    return res
  }))
  const library_signatures = lib_sigs.filter(item=>item!==null).reduce((acc,item)=>{
    const {library: libid, signatures, count, duration: duration_meta_n} = item
    duration_meta = duration_meta + duration_meta_n
    acc = {
      ...acc,
      [libid]: {
        library: libraries[libid],
        signatures,
        count
      }
    }
    return acc
  }, {})
  let count = 0

  const resource_signatures = Object.keys(library_signatures).reduce((acc, libid)=>{
    const resource = library_resource[libid]
    if (resource===undefined) return acc
    if (acc[resource]===undefined){
      acc[resource] = {
        libraries: Set(),
        count: 0,
      }
    }
    acc[resource] = {
      ...acc[resource],
      libraries: acc[resource].libraries.add(libid),
      count: acc[resource].count + library_signatures[libid].count,
    }
    count = count + library_signatures[libid].count
    return acc
  }, {})

  return {
    library_signatures,
    resource_signatures,
    count,
    duration_meta: duration_meta,
    duration: (Date.now() - start) / 1000,
    duration_meta: duration_meta,
    controller: null,
  }
}