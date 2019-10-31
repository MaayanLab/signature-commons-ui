import { put, takeLatest, takeEvery, take, cancelled, all, call, cancel, select } from 'redux-saga/effects'
import { Set } from 'immutable'
import { action_definitions } from "../redux/action-types"
import { fetch_meta } from "../fetch/meta"
import { operationIds,
  fetch_metadata,
  metadataSearcher,
  resolve_entities,
  find_synonyms,
  query_overlap,
  query_rank,
  fetch_bulk_counts_per_parent,
  fetch_all_as_dictionary } from "../helper/fetch_methods"
import { fetch_count } from "../helper/server_side"
import {parse_entities} from "../helper/misc"
import { fetchMetaDataSucceeded,
  fetchMetaDataFailed,
  fetchMetaDataAborted,
  updateResolvedEntities,
  matchFailed,
  findSignaturesSucceeded,
  resetSigcom,
  findSignaturesFailed,
  initializeSigcom,
  initializeParents } from "../redux/actions"
import { getStateFromStore } from "./selectors"
import { get_signature_data } from  "../../components/MetadataSearch/download"
import Model from "../helper/APIConnector"
import uuid5 from 'uuid5'

const allWatchedActions = [
  action_definitions.FIND_SIGNATURES,
  action_definitions.FIND_SIGNATURES_FROM_ID,
  action_definitions.MATCH_ENTITY,
  action_definitions.FETCH_METADATA,
  action_definitions.FETCH_METADATA_FROM_SEARCH_BOX,
  action_definitions.RESET_SIGCOM,
]

export function* workInitializeSigcom(action) {
  if (action.type !== action_definitions.INITIALIZE_SIGCOM){
    return
  }
  const controller = new AbortController()
  try{
    const sig_count = yield call(fetch_count, "signatures")
    const lib_count = yield call(fetch_count, "libraries")
    
    const parents_mapping = {}
    const parent_ids_mapping = {}
    let libraries = {}
    if (sig_count>0){
      libraries = yield call(fetch_all_as_dictionary, { table: "libraries", controller })
      parents_mapping["signatures"] = "library"
      parent_ids_mapping["signatures"] = libraries
    }
    if (lib_count>0){
      let resources = yield call(fetch_all_as_dictionary, { table: "resources", controller })
      if (resources===null){
        resources = libraries
        parents_mapping["libraries"] = "library"
      }else{
        parents_mapping["libraries"] = "resource"
      }
      parent_ids_mapping["libraries"] = resources
    }

    yield put(initializeParents({parent_ids_mapping, parents_mapping}))
  } catch (error) {
      console.log(error)
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        console.log("Aborted")
      }
   }
}

function* watchInitializeSigcom() {
  const task = yield takeLatest(action_definitions.INITIALIZE_SIGCOM, workInitializeSigcom)
}

export function* workResetSigcom(action) {
  return
}

function* watchResetSigcom() {
  const task = yield takeLatest(allWatchedActions, workResetSigcom)
}
// Metadata Search
export function* workFetchMetaData(action) {
   if (action.type !== action_definitions.FETCH_METADATA_FROM_SEARCH_BOX &&
    action.type !== action_definitions.FETCH_METADATA){
    return
   }
   const controller = new AbortController()
   try {
      const {params} = action
      const {search, ...search_models} = params
      const { models } = yield select(getStateFromStore)
      const search_calls = Object.keys(models).map(table=>{
        const model = models[table]
        const {value_count_params, operations, filters, ...rest } = params[table] || {operations: {count: true}}
        const parent_ids = filters !== undefined ? filters[parent[table]]: undefined
        const q = {
          query: {
            ...rest,
            filters,
            search: params.search,
          },
          parent_ids,
          ...operations
        }
        return model.fetch_meta(q, controller)
      })
      const m = yield all([...search_calls])
      const updated_models = m.reduce((acc,item)=>{
        acc = {
          ...acc,
          [item.table]: item.model
        }
        return acc
      },{})
      yield put(fetchMetaDataSucceeded(updated_models))
  } catch (error) {
      console.log(error)
      yield put(fetchMetaDataFailed(error))
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        console.log("Aborted")
        yield put(fetchMetaDataAborted("aborted"))
      }
   }
}

function* watchFetchMetaData() {
  const ask = yield takeLatest(allWatchedActions, workFetchMetaData)
}


// export function* workFetchMetaData(action) {
//    if (action.type !== action_definitions.FETCH_METADATA){
//     return
//    } 
   
//    const controller = new AbortController()
//    try {
//       const {params, table} = action
//       const { parents_mapping: parents,
//         parent_ids_mapping
//       } = yield select(getStateFromStore)

//       const search_filters = params[table] || {}
      
//       const match_calls = call(metadataSearcher, {
//           table,
//           operationId: operationIds[table],
//           parent: parents[table],
//           parents_meta: parent_ids_mapping[table],
//           search: params.search,
//           search_filters,
//           controller,
//         })

//       let results
//       if (!paginating){
//         const count_calls = call(fetch_bulk_counts_per_parent, {
//           table,
//           operationId: operationIds[table],
//           parent: parents[table],
//           parent_ids: Object.keys(selected_parent_ids_mapping[table]).length > 0 ? Object.keys(selected_parent_ids_mapping[table]): Object.keys(parent_ids_mapping[table]), // Use selected if it exists
//           search,
//           controller,
//         })
//         results = yield all([count_calls, match_calls])
//       }else {
//         results = yield all([match_calls])
//       }
//       let table_count = undefined
//       let table_count_per_parent = undefined
//       let metadata_results = {}
//       for (const item of results){
//         const {table, count, count_per_parent, matches} = item
//         if (matches !== undefined){
//           metadata_results = matches
//         }else{
//           table_count = count
//           table_count_per_parent = count_per_parent
//         }
//       }
//       yield put(fetchMetaDataSucceeded(action.table, table_count, table_count_per_parent, metadata_results, paginating))
//    } catch (error) {
//       console.log(error)
//       yield put(fetchMetaDataFailed(error))
//       controller.abort()
//    } finally {
//       if (yield cancelled()){
//         controller.abort()
//         yield put(fetchMetaDataAborted("aborted"))
//       }
//    }
// }

// function* watchFetchMetaData() {
//   const task = yield takeLatest(allWatchedActions, workFetchMetaData)
// }

// Match Entities
export function* workMatchEntities(action) {
   // Cancel other tasks
   if (action.type !== action_definitions.MATCH_ENTITY){
    return
   }
   const controller = new AbortController()
   try {
      let { input } = action
      if (input.type === 'Overlap'){
        const unresolved_entities = input.unresolved
        const { matched: entities, mismatched } = yield call(resolve_entities, { entities: unresolved_entities, controller })
        const unresolved = unresolved_entities.subtract(Set(Object.keys(entities)))
        input = {
          ...input,
          entities: {
            ...input.entities,
            ...entities
          },
          unresolved,
          mismatched
        }
        yield put(updateResolvedEntities(input))
      }else if (input.type === 'Rank'){
        const unresolved_entities = input.unresolved
        const { matched: entities, mismatched } = yield call(resolve_entities, { entities: unresolved_entities, controller })
        const unresolved = unresolved_entities.subtract(Set(Object.keys(entities)))
        const up_entities = Set(input.up_geneset).intersect(Set(Object.keys(entities))).reduce((acc,entity)=>{
          acc[entity] = entities[entity]
          return acc
        }, {...input.up_entities})
        const down_entities = Set(input.down_geneset).intersect(Set(Object.keys(entities))).reduce((acc,entity)=>{
          acc[entity] = entities[entity]
          return acc
        }, {...input.down_entities})
        const resolvable_list = yield all([...mismatched.map(term=>call(find_synonyms, {term, controller}))])
        const resolvable = resolvable_list.filter(r=>Object.keys(r.synonyms).length>0).reduce((acc,r)=>{
          acc[r.term] = r.synonyms
          return acc
        },{})
        input = {
          ...input,
          up_entities,
          down_entities,
          unresolved,
          mismatched,
          resolvable
        }
        yield put(updateResolvedEntities(input))
      }
   } catch (error) {
      console.log(error)
      yield put(matchFailed(error))
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        yield put(matchFailed("aborted"))
      }
   }
}

function* watchMatchEntities() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workMatchEntities)
}

export function* workFindSignature(action) {
  if (action.type !== action_definitions.FIND_SIGNATURES){
    return
   }
  const controller = new AbortController()
  try {
      let { input } = action
      if (input.type==="Overlap"){
        const unresolved_entities = parse_entities(input.geneset)
        const { matched: entities, mismatched } = yield call(resolve_entities, { entities: unresolved_entities, controller })
        const resolved_entities = [...(unresolved_entities.subtract(mismatched))].map((entity) => entities[entity])
        const signature_id = input.id || uuid5(JSON.stringify(resolved_entities))

        const signature_result = yield call(query_overlap, {
          input: {
            entities
          },
          controller,
        })
        const results = {
          ...signature_result,
          mismatched,
          input: {
            ...input,
            id: signature_id,
            entities: resolved_entities,
          }
        }
        yield put(findSignaturesSucceeded(results))
      }else if (input.type==="Rank"){
        const unresolved_up_entities = parse_entities(input.up_geneset)
        const unresolved_down_entities = parse_entities(input.down_geneset)
        const unresolved_entities = unresolved_up_entities.union(unresolved_down_entities)
        const { matched: entities, mismatched } = yield call(resolve_entities, { entities: unresolved_entities, controller })
        const resolved_up_entities = [...unresolved_up_entities.subtract(mismatched)].map((entity) => entities[entity])
        const resolved_down_entities = [...unresolved_down_entities.subtract(mismatched)].map((entity) => entities[entity])
        const signature_id = input.id || uuid5(JSON.stringify([resolved_up_entities, resolved_down_entities]))
        const signature_result = yield call(query_rank, { 
          input: {
            up_entities: resolved_up_entities,
            down_entities: resolved_down_entities,
          },
        controller,
        })
        const results = {
          ...signature_result,
          mismatched,
          input: {
            ...input,
            id: signature_id,
            up_entities: resolved_up_entities,
            down_entities: resolved_down_entities,
          }
        }
        yield put(findSignaturesSucceeded(results))
      }
   } catch (error) {
      console.log(error)
      yield put(findSignaturesFailed(error))
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        yield put(findSignaturesFailed("aborted"))
      }
   }
}

function* watchFindSignature() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workFindSignature)
}

export function* workFindSignatureFromId(action) {
  if (action.type !== action_definitions.FIND_SIGNATURES_FROM_ID){
    return
   }
  const controller = new AbortController()
  try {
      let { id, search_type } = action
      const data = yield call(get_signature_data, {item: id, search_type})
      let input = {
        type: search_type,
        ...data
      }
      if (input.type==="Overlap"){
        const signature_id = id

        const signature_result = yield call(query_overlap, {
          input,
          controller,
        })
        const results = {
          ...signature_result,
          input: {
            ...input,
            id: signature_id,
          }
        }
        yield put(findSignaturesSucceeded(results))
      }else if (input.type==="Rank"){
        const signature_id = id
        const signature_result = yield call(query_rank, { 
          input,
          controller,
        })
        const results = {
          ...signature_result,
          input: {
            ...input,
            id: signature_id,
          }
        }
        yield put(findSignaturesSucceeded(results))
      }
   } catch (error) {
      console.log(error)
      yield put(findSignaturesFailed(error))
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        yield put(findSignaturesFailed("aborted"))
      }
   }
}

function* watchFindSignatureFromId() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workFindSignatureFromId)
}

export default function* rootSaga() {
  yield all([
      watchFetchMetaData(),
      watchMatchEntities(),
      watchFindSignature(),
      watchResetSigcom(),
      watchFindSignatureFromId(),
      watchInitializeSigcom()
    ]);
}