import { Set } from 'immutable'
import { action_definitions } from "./action-types";

export const initialState = {
  serverSideProps: null,
  search: [],
  selected_parent_ids: {},
  parent_ids_mapping: {},
  parents_mapping: {},
  metadata_table: 'signatures',
  metadata_results: {},
  completed: true,
  loading: false,
  failed: false,
  loading_matches: false,
  loading_signature: false,
  signature_input: {},
  signature_results: {},
  metadata_results: {},
  table_count: {}, // Number of result per table i.e. datasets, signatures
  table_count_per_parent: {}, // Number of result per table grouped by its parents
  operationIDs: {
    signatures_count: "Signature.count",
    libraries_count: "Library.count",
  }
};

function rootReducer(state = initialState, action) {
  if (action.type === action_definitions.INITIALIZE_SIGCOM) {
    const libraries = action.serverSideProps.libraries
    const resources = action.serverSideProps.resources_id
    return {
      ...state,
      serverSideProps: action.serverSideProps,
      parent_ids_mapping: {
        signatures: libraries,
        libraries: Object.keys(resources).length > 0 ? resources: libraries,
      },
      selected_parent_ids: {
        signatures: libraries,
        libraries: Object.keys(resources).length > 0 ? resources: libraries,
      },
      parents_mapping: {
        signatures: "library",
        libraries: Object.keys(resources).length > 0 ? "resource": "id", // just search among self if no parent
      }
    }
  }
  if (action.type === action_definitions.CHANGE_METADATA_SEARCH_TABLE) {
    return {
      ...state,
      metadata_table: action.table
    }
  }


  if (action.type === action_definitions.FETCH_METADATA_FROM_SEARCH_BOX) {
    return {
      ...state,
      search: action.search,
      loading: true,
      table_count: {},
      table_count_per_parent: {},
      failed: false,
      completed: false,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_SUCCEEDED) {
    console.log(action)
    return {
      ...state,
      completed: true,
      loading: false,
      failed: false,
      table_count: action.table_count,
      table_count_per_parent: action.table_count_per_parent,
      metadata_results: action.metadata_results,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_FAILED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      failed: true,
      loading: false,
    });
  }
  if (action.type === action_definitions.FETCH_METADATA_FROM_SEARCH_BOX_ABORTED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      loading: true,
      failed: false,
    });
  }


  if (action.type === action_definitions.FETCH_METADATA_COUNT) {
    return {
      ...state,
      search: action.search,
      loading: true,
      failed: false,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_COUNT_SUCCEEDED) {
    const count = {
        ...state.count,
        [action.table]: action.count
      }
    return Object.assign({}, state, {
      count,
      count_per_parent: {
        ...state.count_per_parent,
        [action.table]: action.count_per_parent
      },
      loading: false,
      failed: false,
    });
  }
  if (action.type === action_definitions.FETCH_METADATA_COUNT_FAILED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      failed: true,
      loading: false,
    });
  }
  if (action.type === action_definitions.FETCH_METADATA_COUNT_ABORTED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      loading: true,
      failed: false,
    });
  }
  if (action.type === action_definitions.FETCH_METADATA) {
    return {
      ...state,
      search: action.search,
      loading: true
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_SUCCEEDED) {
    return Object.assign({}, state, {
      metadata_results: action.results,
      completed: true,
      loading: false
    });
  }
  if (action.type === action_definitions.FETCH_METADATA_FAILED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      loading: false,
    });
  }
  if (action.type === action_definitions.FETCH_METADATA_ABORTED) {
    return Object.assign({}, state, {
      results: {},
      completed: false,
      loading: true,
    });
  }
  if (action.type === action_definitions.INITIALIZE_SIGNATURE_SEARCH) {
    return {
      ...state,
      signature_input: action.input,
    }
  }
  if (action.type === action_definitions.MATCH_ENTITY) {
    return {
      ...state,
      signature_input: action.input,
      loading_matches: true
    }
  }
  if (action.type === action_definitions.MATCH_FAILED) {
    return {
      ...state,
      loading_matches: false
    }
  }
  if (action.type === action_definitions.UPDATE_RESOLVED_ENTITIES) {
    return {
      ...state,
      signature_input: {
        ...state.signature_input,
        ...action.input,
      },
      loading_matches: false
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES) {
    return {
      ...state,
      signature_input: action.input,
      loading_signature: true
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES_SUCCEEDED) {
    return {
      ...state,
      signature_result: action.signature_result,
      loading_signature: false
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES_FAILED) {
    return {
      ...state,
      loading_signature: false
    }
  }
  return state;
};

export default rootReducer;