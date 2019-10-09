import { fetch_meta_post } from '../fetch/meta'
import { getState } from 'redux-saga/effects'
import { getStateFromStore } from "../sagas/selectors"

const model_mapper = {
  resources: "Resource",
  libraries: "Library",
  signatures: "Signature",
  entities: "Entity"
}

export function build_where({search, parent, filters}) {
  let where = {}
  let andClauses = []
  let orClauses = []

  for (const q of search) {
    if (q.indexOf(':') !== -1) {
      const [key, ...value] = q.split(':')
      if (key.startsWith('!') || key.startsWith('-')) {
        andClauses = [...andClauses, { ['meta.' + key.substring(1).trim()]: { nilike: '%' + value.join(':') + '%' } }]
      } else if (key.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { ['meta.' + key.substring(3).trim()]: { ilike: '%' + value.join(':') + '%' } }]
      } else if (key.startsWith('|')) {
        orClauses = [...orClauses, { ['meta.' + key.substring(1).trim()]: { ilike: '%' + value.join(':') + '%' } }]
      } else {
        andClauses = [...andClauses, { ['meta.' + key.trim()]: { ilike: '%' + value.join(':') + '%' } }]
      }
    } else {
      // full text query
      if (q.startsWith('!') || q.startsWith('-')) {
        // and not
        const slist = q.substring(1).trim().split(" ")
        const query = slist.map(s=>({ meta: {fullTextSearch: { ne: s }} } ))
        andClauses = [...andClauses, ...query]
        // andClauses = [...andClauses, { meta: { fullTextSearch: { ne: q.substring(1).trim() } } }]
      } else if (q.toLowerCase().startsWith('or ')) {
        // const slist = q.substring(3).trim().split(" ")
        // const query = {and: slist.map(s=>({ fullTextSearch: { eq: s } } ))}
        // orClauses = [...andClauses, query]
        const slist = q.substring(3).trim().split(" ")
        const query = {and: slist.map(s=>({ meta: {fullTextSearch: { eq: s }} } ))}
        orClauses = [...orClauses, query]
        // orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(3).trim() } } }]
      } else if (q.startsWith('|')) {
        // const slist = q.substring(1).trim().split(" ")
        // const query = {and: slist.map(s=>({ fullTextSearch: { eq: s } } ))}
        // orClauses = [...andClauses, query]
        const slist = q.substring(1).trim().split(" ")
        const query = {and: slist.map(s=>({ meta: {fullTextSearch: { eq: s }} } ))}
        orClauses = [...orClauses, query]
        // orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(1).trim() } } }]
      } else {
        // and
        const slist = q.trim().split(" ")
        const query = slist.map(s=>({ meta: {fullTextSearch: { eq: s }} } ))
        andClauses = [...andClauses, ...query]
        
        // andClauses = [...andClauses, { meta: { fullTextSearch: { eq: q.trim() } } }]
      }
    }
  }
  if (orClauses.length > 0) {
    if (andClauses.length > 0) {
      orClauses = [...orClauses, { and: andClauses }]
    }
    where['or'] = orClauses
  } else {
    where['and'] = andClauses
  }

  if (filters!==undefined){
    if (where.and === undefined){
      where = {
        and: [...where]
      }
    }
    for (const [filter, values] of Object.entries(filters)){
      if (filter===parent) {
        where = {
          and: [...where.and, {
            [filter]: {inq: [...values]}
            }
          ]
        }
      }
    }
  }

  return where
}

export default class Model {
  constructor(table, parent, parents_meta) {
    this.model = model_mapper[table]
    this.table = table
    this.parent = parent
    this.parents_meta = parents_meta
    this.where = null
    this.results = {}
    this.search = null
    this.filters = undefined
    this.pagination = {
      limit: 10
    }
  }

  set_where = ({search, filters}) => {
    this.search = search
    this.filters = filters
    this.where = build_where({search, parent: this.parent, filters})
  }

  get_count_params = ({search, filters}) => {
    if (this.where===null){
      this.set_where({search, filters})
    }
    const operationId = `${this.model}.count`
    const params = {
      operationId,
      parameters: {
        where: this.where
      }
    }
    return params
  }

  get_count_per_parent_params = ({search, filters, parent_ids}) => {
    if (this.where===null) this.set_where({search, filters})
    if (parent_ids === undefined) parent_ids = Object.keys(this.parents_meta)
    const operationId = `${this.model}.count`
    const params = parent_ids.map(parent_id=>{
      let where = this.where
      console.log(where)
      if (where.and === undefined) {
        where = {
          and: [{...where}]
        }
      }
      where = {
        and: [
          ...where.and,
          {[this.parent]: parent_id}
        ]
      }
      return {
        operationId,
        parameters: {
          where
        }
      }
    })
    return params
  }

  get_search_params = ({search, filters, limit, skip}) => {
    if (limit===undefined) limit=10
    if (this.where===null){
      this.set_where({search, filters})
    }
    this.pagination = {
        limit,
        skip,
      }
    const operationId = `${this.model}.find`
    const params = {
      operationId,
      parameters: {
        filter:{
          where: this.where,
          ...this.pagination
        }
      }
    }
    return params
  }

  get_value_count = ({search, filters, fields, limit}) => {
    if (this.where===null){
      this.set_where({search, filters})
    }
    if (limit===undefined) limit = 10
    const operationId = `${this.model}.value_count`
    if (fields!==undefined){
      return {
        operationId,
        parameters: {
          filter: {
              where: this.where,
              fields,
            },
          }
      }
    }
  }

  // {
  //   fetch_meta: true
  //   count: true,
  //   per_parent_count: true,
  //   value_count: true
  //   query: {
  //     search: [...],
  //     filters: {
  //       [filter_field]: [...]
  //     },
  //     skip,
  //     limit
  //   },
  //   parent_ids: [...]
  //   value_count_params: {
  //     fields: [...],
  //     skip,
  //     limit
  //   }
  // }
  build_query = (query_params) => {
    const {metadata_search,
      count,
      per_parent_count,
      value_count,
      query,
      parent_ids,
      value_count_params
    } = query_params
    let params = []
    const { search, filters} = query
    this.set_where({search, filters})
    if (metadata_search){
      const p = this.get_search_params({...query})
      params = [...params, p]
    }
    if (value_count && value_count_params!==undefined){
      const p = this.get_value_count({search, filters, ...value_count_params})
      params = [...params, p]
    }
    if (count) {
      const p = this.get_count_params({search, filters}) 
      params = [...params, p]
    }
    if (per_parent_count) {
      const p = this.get_count_per_parent_params({search, filters, parent_ids})
      params = [...params, ...p]
    }

    return {
      params,
      operations: {
        metadata_search,
        value_count: value_count && value_count_params!==undefined,
        count,
        per_parent_count,
      }
    }
  }

  parse_bulk_result = ({operations, bulk_response, parent_ids}) => {
    if (parent_ids === undefined) parent_ids = Object.keys(this.parents_meta)
    const {
      metadata_search,
      value_count,
      count,
      per_parent_count
    } = operations
    let result = {}
    let response = bulk_response
    if (metadata_search) {
      const [m, ...r] = response
      const res = m.response.map(r=>{
        const parent_id = r[this.parent]
        const parent_meta = this.parents_meta[parent_id]
        return {
          ...r,
          [this.parent]: parent_meta,
        }
      })
      response = [...r]
      result = {
        ...result,
        metadata_search: res,
      }
    }
    if (value_count && value_count_params!==undefined) {
      const [m, ...r] = response
      response = [...r]
      result = {
        ...result,
        value_count: m.response
      }
    }
    if (count) {
      const [m, ...r] = response
      response = [...r]
      result = {
        ...result,
        count: m.response.count
      }
    }
    if (per_parent_count) {
      const m = [...response]
      const per_parent_count = m.map((m_res, index) =>({
        parent_id: parent_ids[index],
        count: m_res.response.count
      })).reduce((acc, item)=>{
        acc[item.parent_id]= item.count
        return acc
      },{})
      result = {
        ...result,
        per_parent_count
      }
    }
    return result
  }

  fetch_meta = async (query_params, controller) => {
    const {params, operations} = this.build_query(query_params)
    let {response: bulk_response, duration} = await fetch_meta_post({
      endpoint: '/bulk',
      body: params,
      signal: controller.signal,
    })
    const parent_ids = params.parent_ids || Object.keys(this.parents_meta)
    const result = this.parse_bulk_result({operations, bulk_response, parent_ids})

    this.results = {
      metadata_search: result.metadata_search || this.results.metadata_search,
      value_count: result.value_count || this.results.value_count,
      count: result.count || this.results.count,
      per_parent_count: result.per_parent_count || this.results.per_parent_count,
    }
    return {table: this.table, model:this}
  }

}