import { action_definitions } from './action-types'

export function initializeSigcom() {
  return { type: action_definitions.INITIALIZE_SIGCOM }
}

export function initializePreferredName(ui_values) {
  return { type: action_definitions.INITIALIZE_PREFERRED_NAMES, ui_values }
}

export function initializeTheme(theme) {
  return { type: action_definitions.INITIALIZE_THEME, theme }
}

export function fetchUIValuesSucceeded(ui_values) {
  return { type: action_definitions.FETCH_UI_VALUES_SUCCEEDED, ui_values }
}

export function fetchSummarySucceeded(serverSideProps) {
  return { type: action_definitions.FETCH_SUMMARY_SUCCEEDED, serverSideProps }
}

export function fetchKeyCountSucceeded(key_count) {
  return { type: action_definitions.FETCH_KEY_COUNT_SUCCEEDED, key_count }
}

// export function initializeParents({ parent_ids_mapping, parents_mapping }) {
//   return { type: action_definitions.INITIALIZE_PARENTS, parent_ids_mapping, parents_mapping }
// }

export function initializeParents({ parents_mapping }) {
  return { type: action_definitions.INITIALIZE_PARENTS, parents_mapping }
}

export function resetSigcom() {
  return { type: action_definitions.RESET_SIGCOM }
}

export function changeMetadataSearchTable(table) {
  return { type: action_definitions.CHANGE_METADATA_SEARCH_TABLE, table }
}

// Metadata search using search box
export function fetchMetaDataFromSearchBox(params) {
  return { type: action_definitions.FETCH_METADATA_FROM_SEARCH_BOX,
    params }
}

// change parent
// export function filterMetadataSearch(search, filter, paginating, table){
//   return {type: action_definitions.FILTER_METADATA_SEARCH, search, filter, paginating, table}
// }


// // Paginate
// export function paginateMetaData(params, table) {
//   return {type: action_definitions.PAGINATE_METADATA, search, filters, skip, limit, table}
// }

// export function paginateMetaDataSucceeded(results){
//   return {type: action_definitions.PAGINATE_METADATA_SUCCEEDED,
//     table,
//     table_count,
//     table_count_per_parent,
//     metadata_results
//   }
// }

// export function paginateMetaDataFailed(error, loading){
//   return {type: action_definitions.PAGINATE_METADATA_FAILED, error}
// }

// Snackbar
export function reportError(error) {
  return { type: action_definitions.REPORT_ERROR,
    error,
  }
}

export function closeSnackBar() {
  return { type: action_definitions.CLOSE_SNACK_BAR }
}

// Metadata search
export function fetchMetaData(params) {
  return { type: action_definitions.FETCH_METADATA, params }
}

export function fetchMetaDataSucceeded(models) {
  return { type: action_definitions.FETCH_METADATA_SUCCEEDED,
    models,
  }
}

export function fetchMetaDataFailed(error, loading) {
  return { type: action_definitions.FETCH_METADATA_FAILED, error }
}

export function fetchMetaDataAborted(error) {
  return { type: action_definitions.FETCH_METADATA_ABORTED, error }
}

export function initializeSignatureSearch(input) {
  return { type: action_definitions.INITIALIZE_SIGNATURE_SEARCH, input }
}

export function updateInput(input) {
  return { type: action_definitions.UPDATE_INPUT, input }
}

export function matchEntity(input) {
  return { type: action_definitions.MATCH_ENTITY, input }
}

export function findSignatures(input) {
  return { type: action_definitions.FIND_SIGNATURES, input }
}

export function findSignaturesFromId(search_type, id) {
  return { type: action_definitions.FIND_SIGNATURES_FROM_ID, search_type, id }
}

export function updateResolvedEntities(input) {
  return { type: action_definitions.UPDATE_RESOLVED_ENTITIES, input }
}
export function matchFailed(error) {
  return { type: action_definitions.MATCH_FAILED, error }
}

export function findSignaturesSucceeded(signature_result) {
  return { type: action_definitions.FIND_SIGNATURES_SUCCEEDED, signature_result }
}

export function findSignaturesFailed(error) {
  return { type: action_definitions.FIND_SIGNATURES_FAILED, error }
}

export function getResourcesAndLibrariesSucceeded(props) {
  return { type: action_definitions.GET_RESOURCES_AND_LIBRARIES_SUCCEEDED, props }
}
