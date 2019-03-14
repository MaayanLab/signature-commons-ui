import { fetch_meta_post } from '../../util/fetch/meta'
import { fetch_data } from '../../util/fetch/data'
import { Set } from 'immutable'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'

export async function query(props) {
  if (props.input.type === 'Overlap') {
    return await query_overlap(props)
  } else if (props.input.type === 'Rank') {
    return await query_rank(props)
  }
}

export async function query_overlap(props) {
  let entities
  entities = Set(
    props.input.geneset.toUpperCase().split(/[ \t\n;]+/).map(
       // TODO: handle weights
      (line) => /^(.+?)(,(.+))?$/.exec(line)[1]
    )
  )
  let entity_ids = Set()

  const start = Date.now()

  const {duration: duration_meta_1, response: entity_meta_pre} = await fetch_meta_post('/entities/find', {
    filter: {
      where: {
        'meta.Name': {
          inq: entities.toArray(),
        }
      },
      fields: [
        'id',
        'meta.Name',
      ]
    }
  }, props.controller.signal)
  const entity_meta = maybe_fix_obj(entity_meta_pre)

  for(const entity of Object.values(entity_meta)) {
    const matched_entities = entities.intersect(
      Set([entity.meta.Name])
    )

    if (matched_entities.count() > 0) {
      entities = entities.subtract(matched_entities)
      entity_ids = entity_ids.add(entity.id)
    }
  }

  console.log('matched:', entity_ids.count())
  console.log('mismatched:', entities.count())

  let duration_data = 0
  let count_data = 0
  let enriched_results

  const { response } = await fetch_data('/listdata')

  enriched_results = (await Promise.all(
    response.repositories.filter((repo) => repo.datatype === 'geneset_library').map((repo) =>
      fetch_data('/enrich/overlap', {
        entities: entity_ids,
        signatures: [],
        database: repo.uuid,
        limit: 500,
      }, props.controller.signal)
    )
  )).reduce(
    (results, {duration: duration_data_n, contentRange: contentRange_data_n, response: result}) => {
      duration_data += duration_data_n
      count_data += (contentRange_data_n || {}).count || 0
      return ({
        ...results,
        ...maybe_fix_obj(result.results),
      })
    }, {}
  )

  const {duration: duration_meta_2, response: enriched_signatures_meta} = await fetch_meta_post('/signatures/find', {
    filter: {
      where: {
        id: {
          inq: Object.values(enriched_results).map((k) => k.id)
        }
      }
    }
  }, props.controller.signal)

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
                'meta': entity_meta[id].meta
              })),
            }),
          },
        },
      }
    ]), []
  )

  const resource_signatures = {}
  const library_signatures = {}
  for (const sig of enriched_signatures) {
    if (library_signatures[sig.library] === undefined) {
      library_signatures[sig.library] = {
        library: props.libraries[sig.library],
        signatures: [],
      }
    }
    library_signatures[sig.library].signatures.push({
      ...sig,
      library: props.libraries[sig.library],
    })

    const resource = props.library_resource[sig.library]
    if (resource_signatures[resource] === undefined) {
      resource_signatures[resource] = {
        libraries: Set(),
        count: 0
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
    duration: (Date.now() - start)/1000,
    duration_meta: duration_meta_1 + duration_meta_2,
    matched_entities: entity_ids,
    mismatched_entities: entities,
    controller: null,
  }
}

export async function query_rank(props) {
  let up_entities, down_entities, entities
  up_entities = Set(props.input.up_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[1])) // TODO: handle weights
  down_entities = Set(props.input.down_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[1])) // TODO: handle weights
  entities = Set([...up_entities, ...down_entities])
  let up_entity_ids = Set()
  let down_entity_ids = Set()

  const start = Date.now()

  const {duration: duration_meta_1, response: entity_meta_pre} = await fetch_meta_post('/entities/find', {
    filter: {
      where: {
        'meta.Name': {
          inq: entities.toArray(),
        }
      },
      fields: [
        'id',
        'meta.Name',
      ]
    }
  }, props.controller.signal)
  const entity_meta = maybe_fix_obj(entity_meta_pre)

  for(const entity of Object.values(entity_meta)) {
    const matched_up_entities = up_entities.intersect(
      Set([entity.meta.Name])
    )
    if (matched_up_entities.count() > 0) {
      up_entities = up_entities.subtract(matched_up_entities)
      up_entity_ids = up_entity_ids.add(entity.id)
    }

    const matched_down_entities = down_entities.intersect(
      Set([entity.meta.Name])
    )
    if (matched_down_entities.count() > 0) {
      down_entities = down_entities.subtract(matched_down_entities)
      down_entity_ids = down_entity_ids.add(entity.id)
    }
  }

  console.log('matched:', up_entity_ids.count() + down_entity_ids.count())
  console.log('mismatched:', up_entities.count() + down_entities.count())

  let duration_data = 0
  let count_data = 0
  let enriched_results

  const { response } = await fetch_data('/listdata')

  enriched_results = (await Promise.all(
    response.repositories.filter((repo) => repo.datatype === 'rank_matrix').map((repo) =>
      fetch_data('/enrich/ranktwosided', {
        up_entities: up_entity_ids,
        down_entities: down_entity_ids,
        signatures: [],
        database: repo.uuid,
        limit: 500,
      }, props.controller.signal)
    )
  )).reduce(
    (results, {duration: duration_data_n, contentRange: contentRange_data_n, response: result}) => {
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
                  id: result.signature
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

  const {duration: duration_meta_2, response: enriched_signatures_meta} = await fetch_meta_post('/signatures/find', {
    filter: {
      where: {
        id: {
          inq: Object.values(enriched_results).map((k) => k.id)
        }
      }
    }
  }, props.controller.signal)

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
                'meta': entity_meta[id].meta
              })),
            }),
          },
        },
      }
    ]), []
  )

  const resource_signatures = {}
  const library_signatures = {}
  for (const sig of enriched_signatures) {
    if (library_signatures[sig.library] === undefined) {
      library_signatures[sig.library] = {
        library: props.libraries[sig.library],
        signatures: [],
      }
    }
    library_signatures[sig.library].signatures.push({
      ...sig,
      library: props.libraries[sig.library],
    })

    const resource = props.library_resource[sig.library]
    if (resource_signatures[resource] === undefined) {
      resource_signatures[resource] = {
        libraries: Set(),
        count: 0
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
    duration: (Date.now() - start)/1000,
    duration_meta: duration_meta_1 + duration_meta_2,
    matched_entities: up_entity_ids.union(down_entity_ids),
    mismatched_entities: entities,
    controller: null,
  }
}