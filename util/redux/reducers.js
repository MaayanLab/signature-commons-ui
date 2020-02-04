import { action_definitions } from './action-types'
import Model from '../helper/APIConnector'

export const initialState = {
  serverSideProps: null,
  initialized: false,
  search: [],
  selected_parent_ids: {},
  parent_ids_mapping: {},
  parents_mapping: {},
  current_table: 'signatures',
  filter_mapper: {},
  pagination_mapper: {},
  models: {},
  completed: true,
  loading: false,
  failed: false,
  paginating: false,
  loading_matches: false,
  loading_signature: false,
  signature_input: {
    type: 'Overlap',
  },
  signature_result: {},
  table_count: {}, // Number of result per table i.e. datasets, signatures
  table_count_per_parent: {}, // Number of result per table grouped by its parents
  operationIDs: {
    signatures_count: 'Signature.count',
    libraries_count: 'Library.count',
  },
  theme: null,
  ui_values: null,
  error_message: null,
}

function rootReducer(state = initialState, action) {
  if (action.type === action_definitions.INITIALIZE_SIGCOM) {
    return {
      ...state,
      serverSideProps: action.serverSideProps,
    }
  }
  if (action.type === action_definitions.INITIALIZE_PREFERRED_NAMES) {
    const preferred_name = action.ui_values.preferred_name
    return {
      ...state,
      reverse_preferred_name: Object.entries(preferred_name).reduce((acc, [name, preferred]) => {
        acc = {
          ...acc,
          [preferred]: name,
        }
        return acc
      }, {}),
    }
  }
  if (action.type === action_definitions.INITIALIZE_THEME){
    const {theme} = action
    return {
      ...state,
      theme
    }
  }

  if (action.type === action_definitions.FETCH_UI_VALUES_SUCCEEDED) {
    const {ui_values} = action
    return {
      ...state,
      ui_values
    }
  }
  if (action.type === action_definitions.INITIALIZE_PARENTS) {
    // const { parent_ids_mapping, parents_mapping } = action
    const { parents_mapping } = action
    return {
      ...state,
      initialized: true,
      // parent_ids_mapping,
      parents_mapping,
      selected_parent_ids: Object.keys(parents_mapping).reduce((acc, item) => {
        acc[item] = []
        return acc
      }, {}),
    }
  }
  if (action.type === action_definitions.CHANGE_METADATA_SEARCH_TABLE) {
    return {
      ...state,
      current_table: action.table,
    }
  }

  if (action.type === action_definitions.RESET_SIGCOM) {
    return {
      ...state,
      search: [],
      models: {},
      loading: false,
      completed: true,
      signature_input: {
        type: 'Overlap',
      },
      signature_result: {},
      loading_signature: false,
    }
  }

  if (action.type === action_definitions.FETCH_METADATA_FROM_SEARCH_BOX) {
    const { search } = action.params
    return {
      ...state,
      search: search,
      loading: true,
      models: Object.keys(state.parents_mapping).reduce((acc, table) => {
        acc = {
          ...acc,
          [table]: new Model(table, state.parents_mapping[table]),
        }
        return acc
      }, {}),
      failed: false,
      completed: false,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA) {
    const { search } = action.params
    return {
      ...state,
      search: search,
      loading: true,
      failed: false,
      completed: false,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_SUCCEEDED) {
    return {
      ...state,
      completed: true,
      loading: false,
      failed: false,
      models: action.models,
    }
  }
  if (action.type === action_definitions.FETCH_METADATA_FAILED) {
    return Object.assign({}, state, {
      results: {},
      loading: false,
    })
  }
  if (action.type === action_definitions.FETCH_METADATA_ABORTED) {
    return Object.assign({}, state, {
      results: {},
      loading: true,
    })
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
      loading_matches: true,
    }
  }
  if (action.type === action_definitions.MATCH_FAILED) {
    return {
      ...state,
      loading_matches: false,
    }
  }
  if (action.type === action_definitions.UPDATE_RESOLVED_ENTITIES) {
    return {
      ...state,
      signature_input: {
        ...state.signature_input,
        ...action.input,
      },
      loading_matches: false,
    }
  }
  if (action.type === action_definitions.UPDATE_INPUT) {
    return {
      ...state,
      signature_input: action.input,
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES) {
    return {
      ...state,
      signature_input: action.input,
      loading_signature: true,
      signature_result: {},
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES_FROM_ID) {
    return {
      ...state,
      signature_input: action.input,
      loading_signature: true,
      signature_result: {},
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES_SUCCEEDED) {
    return {
      ...state,
      signature_result: action.signature_result,
      loading_signature: false,
      signature_input: action.signature_result.input,
    }
  }
  if (action.type === action_definitions.FIND_SIGNATURES_FAILED) {
    return {
      ...state,
      loading_signature: false,
    }
  }
  if (action.type === action_definitions.REPORT_ERROR) {
    console.log(action)
    return {
      ...state,
      error_message: action.error.message,
    }
  }
  if (action.type === action_definitions.CLOSE_SNACK_BAR) {
    return {
      ...state,
      error_message: null,
    }
  }
  return state
};

export default rootReducer
