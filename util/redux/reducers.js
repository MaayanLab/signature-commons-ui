import { Set } from 'immutable'
import { action_definitions } from "./action-types";

export const initialState = {
  serverSideProps: null,
  search: [],
  metadata_results: {},
  completed: true,
  loading: false,
  loading_matches: false,
  loading_signature: false,
  signature_input: {},
  signature_results: {},
};

function rootReducer(state = initialState, action) {
  console.log(action)
  if (action.type === action_definitions.INITIALIZE_SIGCOM) {
    return {
      ...state,
      serverSideProps: action.serverSideProps,
    }
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