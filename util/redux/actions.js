import { action_definitions } from "./action-types";

export function initializeSigcom(serverSideProps) {
  console.log({type: action_definitions.INITIALIZE_SIGCOM, serverSideProps})
  return {type: action_definitions.INITIALIZE_SIGCOM, serverSideProps}
}

export function fetchMetaData(payload) {
  return {type: action_definitions.FETCH_METADATA, payload}
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

export function fetchMetaDataSucceeded(results){
  return {type: action_definitions.FETCH_METADATA_SUCCEEDED, results}
}

export function fetchMetaDataFailed(error){
  return {type: action_definitions.FETCH_METADATA_FAILED, error}
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