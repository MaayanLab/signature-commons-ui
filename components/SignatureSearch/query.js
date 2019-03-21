import { fetch_meta_post } from '../../util/fetch/meta'
import { fetch_data } from '../../util/fetch/data'
import { Set } from 'immutable'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'

export async function query_overlap(props) {
  const start = Date.now()
  
  let duration_data = 0
  let count_data = 0
  let enriched_results

  const entity_meta = maybe_fix_obj(props.input.entities)
  const entities = props.input.entities.map((entity) => entity.id)

  const { response } = await fetch_data('/listdata')

  enriched_results = (await Promise.all(
    response.repositories.filter((repo) => repo.datatype === 'geneset_library').map((repo) =>
      fetch_data('/enrich/overlap', {
        entities: entities,
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

  const {duration: duration_meta, response: enriched_signatures_meta} = await fetch_meta_post({
    endpoint: '/signatures/find',
    body: {
      filter: {
        where: {
          id: {
            inq: Object.values(enriched_results).map((k) => k.id)
          }
        }
      }
    },
    signal: props.controller.signal
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
    duration_meta: duration_meta,
    controller: null,
  }
}

export async function query_rank(props) {
  const start = Date.now()

  let duration_data = 0
  let count_data = 0
  let enriched_results

  const entity_meta = {
    ...maybe_fix_obj(props.input.up_entities),
    ...maybe_fix_obj(props.input.down_entities),
  }
  const up_entities = props.input.up_entities.map((entity) => entity.id)
  const down_entities = props.input.down_entities.map((entity) => entity.id)
  
  const { response } = await fetch_data('/listdata')

  enriched_results = (await Promise.all(
    response.repositories.filter((repo) => repo.datatype === 'rank_matrix').map((repo) =>
      fetch_data('/enrich/ranktwosided', {
        up_entities: up_entities,
        down_entities: down_entities,
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

  const {duration: duration_meta, response: enriched_signatures_meta} = await fetch_meta_post({
    endpoint: '/signatures/find',
    body: {
      filter: {
        where: {
          id: {
            inq: Object.values(enriched_results).map((k) => k.id)
          }
        }
      }
    },
    signal: props.controller.signal
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
    duration_meta: duration_meta,
    controller: null,
  }
}