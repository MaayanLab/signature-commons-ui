import { action_definitions } from "./action-types";

export function initializeSigcom(payload) {
  console.log(payload)
  return {type: action_definitions.INITIALIZE_SIGCOM, payload}
}

export function fetchMetaData(payload) {
  console.log(payload)
  return {type: action_definitions.FETCH_METADATA, payload}
}

export function initializeSignatureSearch(input){
  return {type:action_definitions.INITIALIZE_SIGNATURE_SEARCH, input}
}

export function matchEntity(input) {
  return {type: action_definitions.MATCH_ENTITY, input}
}

export function findSignature(input) {
  return {type: action_definitions.FIND_SIGNATURES, input}
}
export function updateResolvedEntities(input){
  return {type: action_definitions.UPDATE_RESOLVED_ENTITIES, input}
}
