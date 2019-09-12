import { action_definitions } from "./action-types";

export function initializeSigcom(serverSideProps) {
  console.log({type: action_definitions.INITIALIZE_SIGCOM, serverSideProps})
  return {type: action_definitions.INITIALIZE_SIGCOM, serverSideProps}
}

export function changeMetadataSearchTable(table){
  return {type: action_definitions.CHANGE_METADATA_SEARCH_TABLE, table}
}

// Metadata search using search box
export function fetchMetaDataFromSearchBox(search) {
  return {type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX, search}
}

export function fetchMetaDataFromSearchBoxSucceeded(table_count, table_count_per_parent, metadata_results){
  return {type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_SUCCEEDED,
    table_count,
    table_count_per_parent,
    metadata_results
  }
}

export function fetchMetaDataFromSearchBoxFailed(error, loading){
  return {type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_FAILED, error}
}

export function fetchMetaDataFromSearchBoxAborted(type, error){
  return {type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_ABORTED, error}
}







// Metadata search
export function fetchMetaDataCount({table, parent, parent_ids, filter, params, search, controller}) {
  return {type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX,
    filter,
    table,
    parent,
    parent_ids,
    params,
    search,
    controller}
}

export function fetchMetaDataCountSucceeded(count, count_per_parent, table, all=false){
  return {type: action_definitions.FETCH_METADATA_COUNT_SUCCEEDED, count, count_per_parent, table, all}
}

export function fetchMetaDataCountFailed(error, loading){
  return {type: action_definitions.FETCH_METADATA_COUNT_FAILED, error}
}

export function fetchMetaDataCountAborted(type, error){
  return {type: action_definitions.FETCH_METADATA_COUNT_ABORTED, error}
}

export function fetchMetaData(search) {
  return {type: action_definitions.FETCH_METADATA, search}
}

export function fetchMetaDataSucceeded(results){
  return {type: action_definitions.FETCH_METADATA_SUCCEEDED, results}
}

export function fetchMetaDataFailed(error, loading){
  return {type: action_definitions.FETCH_METADATA_FAILED, error}
}

export function fetchMetaDataAborted(error){
  return {type: action_definitions.FETCH_METADATA_ABORTED, error}
}

export function initializeSignatureSearch(input){
  return {type:action_definitions.INITIALIZE_SIGNATURE_SEARCH, input}
}

export function matchEntity(input) {
  return {type: action_definitions.MATCH_ENTITY, input}
}

export function findSignature(input, props) {
  return {type: action_definitions.FIND_SIGNATURES, input, props}
}

export function updateResolvedEntities(input){
  return {type: action_definitions.UPDATE_RESOLVED_ENTITIES, input}
}
export function matchFailed(error){
  return {type: action_definitions.MATCH_FAILED, error}
}

export function findSignaturesSucceeded(signature_result) {
  return {type: action_definitions.FIND_SIGNATURES_SUCCEEDED, signature_result}
}

export function findSignaturesFailed(error) {
  return {type: action_definitions.FIND_SIGNATURES_FAILED, error}
}