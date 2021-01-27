import { put, takeLatest, cancelled, all, call, select } from 'redux-saga/effects'
import { action_definitions } from '../redux/action-types'
import { get_summary_statistics,
  resolve_entities,
  query_overlap,
  query_rank,
  get_key_count,
} from '../helper/fetch_methods'
import { fetch_count } from '../helper/server_side'
import { fill_palette } from '../ui/theme_filler'
import { fetchMetaDataSucceeded,
  fetchMetaDataFailed,
  fetchMetaDataAborted,
  updateResolvedEntities,
  matchFailed,
  findSignaturesSucceeded,
  findSignaturesFailed,
  initializeParents,
  fetchUIValuesSucceeded,
  initializeTheme,
  initializePreferredName,
  updateInput,
  reportError,
  fetchSummarySucceeded,
  fetchKeyCountSucceeded,
  getResourcesAndLibrariesSucceeded,
  getSearchFiltersSucceeded,
} from '../redux/actions'
import { getStateFromStore } from './selectors'
import { get_signature_data } from '../../components/MetadataSearch/download'
import { get_ui_values } from '../../pages'
import uuid5 from 'uuid5'
import defaultTheme from '../ui/theme-provider'
import { createMuiTheme } from '@material-ui/core'
import merge from 'deepmerge'
import {getResourcesAndLibraries} from '../ui/getResourcesAndLibraries'
import {getSearchFilters} from '../ui/getSearchFilters'

const allWatchedActions = [
  action_definitions.FIND_SIGNATURES,
  action_definitions.FIND_SIGNATURES_FROM_ID,
  action_definitions.MATCH_ENTITY,
  action_definitions.FETCH_METADATA,
  action_definitions.FETCH_METADATA_FROM_SEARCH_BOX,
  action_definitions.RESET_SIGCOM,
]

export function *workInitializeSigcom(action) {
  if (action.type !== action_definitions.INITIALIZE_SIGCOM) {
    return
  }
  const controller = new AbortController()
  try {
    // Summary statistics
    const { serverSideProps } = yield call(get_summary_statistics)
    yield put(fetchSummarySucceeded(serverSideProps))
    
    // Get library and resource mapping
    const lib_resource_props = yield call(getResourcesAndLibraries, serverSideProps.schemas)
    yield put(getResourcesAndLibrariesSucceeded(lib_resource_props))

    // Search filters
    const search_filters = yield call(getSearchFilters, serverSideProps.schemas)
    yield put(getSearchFiltersSucceeded(search_filters))


    // ui values
    const { ui_values } = yield call(get_ui_values)
    yield put(fetchUIValuesSucceeded(ui_values))
    yield put(initializePreferredName(ui_values))

    // fetch key_counts
    const { key_count } = yield call(get_key_count, Object.keys(ui_values.preferred_name))
    yield put(fetchKeyCountSucceeded(key_count))

    // theme
    const theme = createMuiTheme(merge(defaultTheme, ui_values.theme_mod))
    theme.shadows[4] = theme.shadows[0]
    // if (theme.palette.default.dark===undefined){
    //   theme.palette.default.dark = darken(theme.palette.default.main, tonalOffset*1.5)
    // }
    // if (theme.palette.default.dark===undefined){
    //   theme.palette.default.light = lighten(theme.palette.default.main, tonalOffset)
    // }

    // Get variables for offsetting colors
    const tonalOffset = theme.palette.tonalOffset
    const contrastThreshold = theme.palette.contrastThreshold
    // fill theme
    theme.palette = Object.entries(theme.palette).reduce((acc, [key, val]) => {
      if (val.main !== undefined) {
        acc[key] = fill_palette(val, tonalOffset, contrastThreshold)
      } else {
        acc[key] = val
      }
      return acc
    }, {})
    // //  default palette
    // const default_palette = theme.palette.default
    // theme.palette.default = fill_palette(default_palette, tonalOffset, contrastThreshold)
    // //  default card
    // const defaultCard = theme.palette.defaultCard
    // theme.palette.defaultCard = fill_palette(defaultCard, tonalOffset, contrastThreshold)
    // //  default button
    // const defaultButton = theme.palette.defaultButton
    // theme.palette.defaultButton = fill_palette(defaultButton, tonalOffset, contrastThreshold)
    // //  default chip
    // const defaultChip = theme.palette.defaultChip
    // theme.palette.defaultChip = fill_palette(defaultChip, tonalOffset, contrastThreshold)
    // //  default chip light
    // const defaultChipLight = theme.palette.defaultChipLight
    // theme.palette.defaultChipLight = fill_palette(defaultChipLight, tonalOffset, contrastThreshold)

    // card themes
    for (const [ind, card_theme] of Object.entries(theme.card)) {
      if (card_theme.palette.main !== undefined) {
        const main = card_theme.palette
        card_theme.palette = fill_palette(main, tonalOffset, contrastThreshold)
        theme.card[ind] = card_theme
      }
    }


    // theme.palette.action.disabledBackground = theme.palette.secondary.light
    yield put(initializeTheme(theme))

    const sig_count = yield call(fetch_count, 'signatures')
    const lib_count = yield call(fetch_count, 'libraries')
    const resource_count = yield call(fetch_count, 'resources')

    const parents_mapping = {}
    // const parent_ids_mapping = {}
    // let libraries = {}
    if (sig_count > 0) {
      // libraries = yield call(fetch_all_as_dictionary, { table: 'libraries', controller })
      parents_mapping['signatures'] = 'library'
      // parent_ids_mapping['signatures'] = libraries
    }
    if (lib_count > 0) {
      if (resource_count === 0) {
        // resources = libraries
        parents_mapping['libraries'] = 'library'
      } else {
        parents_mapping['libraries'] = 'resource'
      }
      // parent_ids_mapping['libraries'] = resources
    }
    yield put(initializeParents({ parents_mapping }))
    // yield put(initializeParents({ parent_ids_mapping, parents_mapping }))
  } catch (error) {
    yield put(reportError(error))
    console.log(error)
    controller.abort()
  } finally {
    if (yield cancelled()) {
      controller.abort()
      console.log('Aborted')
    }
  }
}

function *watchInitializeSigcom() {
  yield takeLatest(action_definitions.INITIALIZE_SIGCOM, workInitializeSigcom)
}

export function *workResetSigcom(action) {
  return
}

function *watchResetSigcom() {
  yield takeLatest(allWatchedActions, workResetSigcom)
}
// Metadata Search
export function *workFetchMetaData(action) {
  if (action.type !== action_definitions.FETCH_METADATA_FROM_SEARCH_BOX &&
    action.type !== action_definitions.FETCH_METADATA) {
    return
  }
  const controller = new AbortController()
  try {
    const { params } = action
    const { models } = yield select(getStateFromStore)
    const search_calls = Object.keys(models).map((table) => {
      const model = models[table]
      const { operations, filters, ...rest } = params[table] || { operations: { count: true } }
      const parent_ids = filters !== undefined ? filters[parent[table]] : undefined
      const q = {
        query: {
          ...rest,
          filters,
          search: params.search,
        },
        parent_ids,
        ...operations,
      }
      return model.fetch_meta(q, controller)
    })
    const m = yield all([...search_calls])
    const updated_models = m.reduce((acc, item) => {
      acc = {
        ...acc,
        [item.table]: item.model,
      }
      return acc
    }, {})
    yield put(fetchMetaDataSucceeded(updated_models))
  } catch (error) {
    yield put(reportError(error))
    console.log(error)
    yield put(fetchMetaDataFailed(error))
    controller.abort()
  } finally {
    if (yield cancelled()) {
      controller.abort()
      console.log('Aborted')
      yield put(fetchMetaDataAborted('aborted'))
    }
  }
}

function *watchFetchMetaData() {
  yield takeLatest(allWatchedActions, workFetchMetaData)
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
export function *workMatchEntities(action) {
  // Cancel other tasks
  if (action.type !== action_definitions.MATCH_ENTITY) {
    return
  }
  const controller = new AbortController()
  try {
    let { input } = action
    const { ui_values } = yield call(get_ui_values)
    if (input.type === 'Overlap') {
      // yield put(updateInput(input))\
      const { entities } = yield call(resolve_entities, { entities: input.entities,
        entity_strategy: ui_values.entity_strategy,
        synonym_strategy: ui_values.synonym_strategy,
        controller })
      input = {
        ...input,
        entities,
      }
      yield put(updateResolvedEntities(input))
    } else if (input.type === 'Rank') {
      // yield put(updateInput(input))
      const { entities: up_entities } = yield call(resolve_entities, { entities: input.up_entities,
        entity_strategy: ui_values.entity_strategy,
        synonym_strategy: ui_values.synonym_strategy,
        controller })
      const { entities: down_entities } = yield call(resolve_entities, { entities: input.down_entities,
        entity_strategy: ui_values.entity_strategy,
        synonym_strategy: ui_values.synonym_strategy,
        controller })
      input = {
        ...input,
        up_entities,
        down_entities,
      }
      yield put(updateResolvedEntities(input))
    }
  } catch (error) {
    yield put(reportError(error))
    console.log(error)
    yield put(matchFailed(error))
    controller.abort()
  } finally {
    if (yield cancelled()) {
      controller.abort()
      yield put(matchFailed('aborted'))
    }
  }
}

function *watchMatchEntities() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workMatchEntities)
}

export function *workFindSignature(action) {
  if (action.type !== action_definitions.FIND_SIGNATURES) {
    return
  }
  const controller = new AbortController()
  try {
    const { input } = action
    if (input.type === 'Overlap') {
      const entities = input.entities.filter((e) => e.type === 'valid')
      const signature_id = input.id || uuid5(JSON.stringify(entities))
      const signature_result = yield call(query_overlap, {
        input: {
          entities,
        },
        controller,
      })
      const results = {
        ...signature_result,
        input: {
          ...input,
          id: signature_id,
          entities,
        },
      }
      yield put(findSignaturesSucceeded(results))
    } else if (input.type === 'Rank') {
      const up_entities = input.up_entities.filter((e) => e.type === 'valid')
      const down_entities = input.down_entities.filter((e) => e.type === 'valid')
      const signature_id = input.id || uuid5(JSON.stringify([up_entities, down_entities]))
      const signature_result = yield call(query_rank, {
        input: {
          up_entities,
          down_entities,
        },
        controller,
      })
      const results = {
        ...signature_result,
        input: {
          ...input,
          id: signature_id,
          up_entities,
          down_entities,
        },
      }
      yield put(findSignaturesSucceeded(results))
    }
  } catch (error) {
    yield put(reportError(error))
    console.log(error)
    yield put(findSignaturesFailed(error))
    controller.abort()
  } finally {
    if (yield cancelled()) {
      controller.abort()
      yield put(findSignaturesFailed('aborted'))
    }
  }
}

function *watchFindSignature() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workFindSignature)
}

export function *workFindSignatureFromId(action) {
  if (action.type !== action_definitions.FIND_SIGNATURES_FROM_ID) {
    return
  }
  const controller = new AbortController()
  const { id, search_type } = action
  try {
    const data = yield call(get_signature_data, { item: id, search_type })
    if (search_type === 'Overlap') {
      const signature_id = id
      const input = {
        type: search_type,
        ...data,
        entities: Object.values(data.entities),
      }
      const signature_result = yield call(query_overlap, {
        input: {
          ...input,
        },
        controller,
      })
      const results = {
        ...signature_result,
        input: {
          ...input,
          id: signature_id,
        },
      }
      yield put(findSignaturesSucceeded(results))
    } else if (search_type === 'Rank') {
      const signature_id = id
      const input = {
        type: search_type,
        ...data,
        up_entities: Object.values(data.up_entities),
        down_entities: Object.values(data.down_entities),
      }
      const signature_result = yield call(query_rank, {
        input,
        controller,
      })
      const results = {
        ...signature_result,
        input: {
          ...input,
          id: signature_id,
        },
      }
      yield put(findSignaturesSucceeded(results))
    }
  } catch (error) {
    yield put(reportError(error))
    console.log(error)
    let input = ({
      type: search_type,
    })
    if (search_type === 'Overlap') {
      input = {
        ...input,
        geneset: '',
      }
    } else {
      input = {
        ...input,
        up_geneset: '',
        down_geneset: '',
      }
    }
    yield put(updateInput(input))
    yield put(findSignaturesFailed(error))
    controller.abort()
  } finally {
    if (yield cancelled()) {
      controller.abort()
      yield put(findSignaturesFailed('aborted'))
    }
  }
}

function *watchFindSignatureFromId() {
  // const task = yield takeEvery([action_definitions.FETCH_METADATA_COUNT], workMatchEntities)
  // for (const t in task){
  //   yield cancel(task)
  // }
  yield takeLatest(allWatchedActions, workFindSignatureFromId)
}

export default function *rootSaga() {
  yield all([
    watchFetchMetaData(),
    watchMatchEntities(),
    watchFindSignature(),
    watchResetSigcom(),
    watchFindSignatureFromId(),
    watchInitializeSigcom(),
  ])
}
