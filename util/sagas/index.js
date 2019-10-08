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
  fetch_bulk_counts_per_parent } from "../helper/fetch_methods"
import { fetchMetaDataSucceeded,
  fetchMetaDataFailed,
  fetchMetaDataAborted,
  updateResolvedEntities,
  matchFailed,
  findSignaturesSucceeded,
  resetSigcom,
  findSignaturesFailed } from "../redux/actions"
import { getStateFromStore } from "./selectors"
import Model from "../helper/model"


const allWatchedActions = [
  action_definitions.FIND_SIGNATURES,
  action_definitions.MATCH_ENTITY,
  action_definitions.FETCH_METADATA,
  action_definitions.FETCH_METADATA_FROM_SEARCH_BOX,
  action_definitions.RESET_SIGCOM]

function* cancelWorkerSaga (task) {
    yield cancel(task)
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
   console.log(action)
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
          value_count_params,
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
      let { input, props } = action
      if (input.type==="Overlap"){
        console.log(input)
        const signature_result = yield call(query_overlap, { input, controller, ...props } )
        yield put({type: action_definitions.FIND_SIGNATURES_SUCCEEDED, signature_result})
      }else if (input.type==="Rank"){
        console.log(input)
        const signature_result = yield call(query_rank, { input, controller, ...props } )
        yield put(findSignaturesSucceeded(signature_result))
      }
   } catch (error) {
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

export default function* rootSaga() {
  yield all([
      watchFetchMetaData(),
      watchMatchEntities(),
      watchFindSignature(),
      watchFetchMetaData(),
      watchResetSigcom(),
    ]);
}