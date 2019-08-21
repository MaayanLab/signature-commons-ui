import { put, takeLatest, take, cancelled, all, call, cancel } from 'redux-saga/effects'
import { Set } from 'immutable'
import { action_definitions } from "../redux/action-types"
import { fetch_meta } from "../fetch/meta"
import { build_where,
  metadataSearcher,
  resolve_entities,
  find_synonyms,
  query_overlap,
  query_rank } from "../helper/fetch_methods"

// Metadata Search
export function* workFetchMetaData(action) {
   if (action.type !== action_definitions.FETCH_METADATA){
    return
   } 
   const controller = new AbortController()
   try {
      let search
      let params
      if (action.payload!==undefined) search = action.payload.search
      if (search!== undefined){
        params = {
          endpoint: `/libraries`,
          signal: controller.signal,
        }
        const {response: libraries} = yield call(fetch_meta, params)
        const results = yield call(metadataSearcher, {
          controller,
          search
        })
        yield put({type: action_definitions.FETCH_METADATA_SUCCEEDED, results})
      }
   } catch (error) {
      console.log(error)
      yield put({type: action_definitions.FETCH_METADATA_FAILED, error})
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        console.log("aborted")
        yield put({type: action_definitions.FETCH_METADATA_FAILED, error: "aborted"})
      }
   }
}

function* watchFetchMetaData() {
  const task = yield takeLatest([action_definitions.FIND_SIGNATURES, action_definitions.MATCH_ENTITY, action_definitions.FETCH_METADATA], workFetchMetaData)
}

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
        yield put({type: action_definitions.UPDATE_RESOLVED_ENTITIES, input})
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
        yield put({type: action_definitions.UPDATE_RESOLVED_ENTITIES, input})
      }
   } catch (error) {
      console.log(error)
      yield put({type: action_definitions.MATCH_FAILED, error})
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        console.log("aborted")
        yield put({type: action_definitions.MATCH_FAILED, error: "aborted"})
      }
   }
}

function* watchMatchEntities() {
  yield takeLatest([action_definitions.FIND_SIGNATURES, action_definitions.MATCH_ENTITY, action_definitions.FETCH_METADATA], workMatchEntities)
}

export function* workFindSignature(action) {
  if (action.type !== action_definitions.FIND_SIGNATURES){
    return
   }
  const controller = new AbortController()
  try {
      let { input } = action
      if (input.type==="Overlap"){
        console.log(input)
        const signature_result = yield call(query_overlap, { input, controller } )
        yield put({type: action_definitions.FIND_SIGNATURES_SUCCEEDED, signature_result})
      }else if (input.type==="Rank"){
        console.log(input)
        const signature_result = yield call(query_rank, { input, controller } )
        yield put({type: action_definitions.FIND_SIGNATURES_SUCCEEDED, signature_result})
      }
   } catch (error) {
      console.log(error)
      yield put({type: action_definitions.FIND_SIGNATURES_FAILED, error})
      controller.abort()
   } finally {
      if (yield cancelled()){
        controller.abort()
        console.log("aborted")
        yield put({type: action_definitions.FIND_SIGNATURES_FAILED, error: "aborted"})
      }
   }
}

function* watchFindSignature() {
  yield takeLatest([action_definitions.FIND_SIGNATURES, action_definitions.MATCH_ENTITY, action_definitions.FETCH_METADATA], workFindSignature)
}

export default function* rootSaga() {
  yield all([
      watchFetchMetaData(),
      watchMatchEntities(),
      watchFindSignature(),
    ]);
}