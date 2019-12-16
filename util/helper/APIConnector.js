// This contains classes for querying a table with relevant filters
import { fetch_meta_post } from '../fetch/meta'
import isUUID from 'validator/lib/isUUID'

const model_mapper = {
  resources: 'Resource',
  libraries: 'Library',
  signatures: 'Signature',
  entities: 'Entity',
}

export function build_where({ search, filters, order }) {
  if (search.length === 0 && filters===undefined && order===undefined) return undefined
  let where = {}
  let andClauses = []
  let orClauses = []
  let notClauses = []
  for (const q of search) {
    if (isUUID(q) || isUUID(q.substring(1).trim()) || isUUID(q.substring(3).trim())) {
      if (q.startsWith('!') || q.startsWith('-')) {
        // and not
        notClauses = [...andClauses, { id: {ne: q.substring(1)} }]
      } else if (q.toLowerCase().startsWith('or ')) {
        orClauses = [...orClauses, { id: q.substring(3) }]
      } else if (q.startsWith('|')) {
        orClauses = [...orClauses, { id: q.substring(1) }]
      } else {
        // and
        andClauses = [...andClauses, { id: q.substring(1) }]
      }
    } else if (q.indexOf(':') !== -1) {
      const [key, ...value] = q.split(':')
      if (key.startsWith('!') || key.startsWith('-')) {
        notClauses = [...notClauses, { ['meta.' + key.substring(1).trim()]: { nilike: '%' + value.join(':') + '%' } }]
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
        const slist = q.substring(1).trim().split(' ')
        const query = slist.map((s) => ({ meta: { fullTextSearch: { ne: s } } }))
        notClauses = [...notClauses, ...query]
        // andClauses = [...andClauses, { meta: { fullTextSearch: { ne: q.substring(1).trim() } } }]
      } else if (q.toLowerCase().startsWith('or ')) {
        // const slist = q.substring(3).trim().split(" ")
        // const query = {and: slist.map(s=>({ fullTextSearch: { eq: s } } ))}
        // orClauses = [...andClauses, query]
        const slist = q.substring(3).trim().split(' ')
        const query = { and: slist.map((s) => ({ meta: { fullTextSearch: { eq: s } } })) }
        orClauses = [...orClauses, query]
        // orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(3).trim() } } }]
      } else if (q.startsWith('|')) {
        // const slist = q.substring(1).trim().split(" ")
        // const query = {and: slist.map(s=>({ fullTextSearch: { eq: s } } ))}
        // orClauses = [...andClauses, query]
        const slist = q.substring(1).trim().split(' ')
        const query = { and: slist.map((s) => ({ meta: { fullTextSearch: { eq: s } } })) }
        orClauses = [...orClauses, query]
        // orClauses = [...orClauses, { meta: { fullTextSearch: { eq: q.substring(1).trim() } } }]
      } else {
        // and
        const slist = q.trim().split(' ')
        const query = slist.map((s) => ({ meta: { fullTextSearch: { eq: s } } }))
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
  if (notClauses.length > 0) {
    if (where.and !== undefined) {
      where = {
        ...where,
        and: [
          ...where.and,
          ...notClauses,
        ],
      }
    } else if (where.or !== undefined) {
      where = {
        and: [
          { ...where },
          ...notClauses,
        ],
      }
    }
  }

  if (filters !== undefined) {
    if (where.and === undefined) {
      where = {
        and: [{ ...where }],
      }
    }
    for (const [filter, values] of Object.entries(filters)) {
      if (filter.indexOf('..') === -1) {
        where = {
          and: [...where.and, {
            [filter]: { inq: [...values] },
          },
          ],
        }
      }
    }
  }

  if (order !== undefined) {
    if (where.and === undefined) {
      where = {
        and: [{ ...where }],
      }
    }
    where = {
      and: [...where.and, {
        [order]: { neq: null },
      },
      ],
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
    this.results = {count:0}
    this.search = null
    this.filters = undefined
    this.fields = undefined
    this.pagination = {
      limit: 10,
    }
    this.order = undefined
  }

  set_where = ({ search, filters, order }) => {
    this.search = search
    this.filters = filters
    this.where = build_where({ search, filters, order })
  }

  get_count_params = ({ search, filters }) => {
    if (this.where === null) {
      this.set_where({ search, filters })
    }
    const operationId = `${this.model}.count`
    const params = {
      operationId,
      parameters: {
        where: this.where,
      },
    }
    return params
  }

  // get_count_per_parent_params = ({search, filters, parent_ids}) => {
  //   if (this.where===null) this.set_where({search, filters})
  //   if (parent_ids === undefined) parent_ids = Object.keys(this.parents_meta)
  //   const operationId = `${this.model}.count`
  //   const params = parent_ids.map(parent_id=>{
  //     let where = this.where
  //     if (where.and === undefined) {
  //       where = {
  //         and: [{...where}]
  //       }
  //     }
  //     where = {
  //       and: [
  //         ...where.and,
  //         {[this.parent]: parent_id}
  //       ]
  //     }
  //     return {
  //       operationId,
  //       parameters: {
  //         where
  //       }
  //     }
  //   })
  //   return params
  // }

  get_search_params = ({ search, filters, limit, skip, order }) => {
    if (limit === undefined) limit = 10
    if (this.where === null) {
      this.set_where({ search, filters, order })
    }
    this.pagination = {
      limit,
      skip,
    }
    this.order = order
    const operationId = `${this.model}.find`
    const params = {
      operationId,
      parameters: {
        contentRange: false,
        filter: {
          where: this.where,
          ...this.pagination,
          order: this.order !== undefined ? `${this.order} DESC` : undefined,
        },
      },
    }
    return params
  }

  get_value_count = ({ search, filters, fields, limit }) => {
    if (this.where === null) {
      this.set_where({ search, filters })
    }
    if (limit === undefined) limit = 10
    const operationId = `${this.model}.value_count`
    if (fields !== undefined) {
      return {
        operationId,
        parameters: {
          filter: {
            where: this.where,
            fields,
          },
        },
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
    const { metadata_search,
      count,
      value_count,
      query,
    } = query_params
    let params = []
    const { search, filters, order } = query
    this.set_where({ search, filters, order })
    if (metadata_search) {
      const p = this.get_search_params({ ...query })
      params = [...params, p]
    }
    if (value_count && this.fields !== undefined && this.fields.length > 0) {
      const p = this.get_value_count({ search, filters, fields: this.fields })
      params = [...params, p]
    }
    if (count) {
      const p = this.get_count_params({ search, filters })
      params = [...params, p]
    }
    // if (per_parent_count) {
    //   const p = this.get_count_per_parent_params({search, filters, parent_ids})
    //   params = [...params, ...p]
    // }

    return {
      params,
      operations: {
        metadata_search,
        value_count: value_count && this.sorting_fields !== undefined && this.sorting_fields.length > 0,
        count,
      },
    }
  }

  parse_bulk_result = ({ operations, bulk_response }) => {
    const {
      metadata_search,
      value_count,
      count,
    } = operations
    let result = {}
    let response = bulk_response
    if (metadata_search) {
      const [m, ...r] = response
      const res = this.parent === undefined ? m.response :
        m.response.map((r) => {
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
    if (value_count) {
      const [m, ...r] = response

      response = [...r]
      result = {
        ...result,
        value_count: this.sorting_fields.reduce((acc, s) => {
          const field_name = s.meta.Field_Name
          acc[field_name] = {
            schema: s,
            stats: Object.entries(m.response[field_name]).reduce((acc_1,[key, val])=>{
              if (key==="null"){
                return acc_1
              }
              acc_1[key] = val
              return acc_1
            },{}),
          }
          return acc
        }, {}),
      }
    }
    if (count) {
      const [m, ...r] = response

      response = [...r]
      result = {
        ...result,
        count: m.response.count,
      }
    }

    return result
  }

  get_value_count_fields = async () => {
    const { response: sorting_fields } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/counting.json',
            'meta.Filter': true,
            'meta.Table': this.table,
          },
        },
      },
    })
    this.fields = sorting_fields.map((i) => i.meta.Field_Name)
    this.sorting_fields = sorting_fields
  }

  fetch_meta = async (query_params, controller) => {
    if (this.fields === undefined && this.sorting_fields === undefined) {
      await this.get_value_count_fields()
    }
    const { params, operations } = this.build_query(query_params)
    const { response: bulk_response } = await fetch_meta_post({
      endpoint: '/bulk',
      body: params,
      signal: controller.signal,
    })
    const result = this.parse_bulk_result({ operations, bulk_response })
    this.results = {
      metadata_search: result.metadata_search || this.results.metadata_search,
      value_count: result.value_count || this.results.value_count,
      count: result.count || this.results.count,
    }
    return { table: this.table, model: this }
  }
}
