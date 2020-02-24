// This contains classes for querying a table with relevant filters
import { fetch_meta_post, fetch_meta } from '../fetch/meta'
import isUUID from 'validator/lib/isUUID'

const model_mapper = {
  resources: 'Resource',
  libraries: 'Library',
  signatures: 'Signature',
  entities: 'Entity',
}

const plural_mapper = {
  resource: 'resources',
  library: 'libraries',
  signature: 'signatures',
  entity: 'entities',
}

export function build_where({ search, filters, order }) {
  search = search || []
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
        andClauses = [...andClauses, { id: q }]
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
  constructor(table, parent) {
    this.model = model_mapper[table]
    this.table = table
    this.parent = parent
    this.parents_meta = {}
    this.where = null
    this.results = {count:0}
    this.search = null
    this.filters = undefined
    this.fields = undefined
    this.grandparents_meta = {}
    this.parent_to_grandparent = {}
    this.grandparent_to_parent = {}
    this.pagination = {
      limit: 10,
    }
    this.order = undefined
  }

  set_where = ({ search, filters, order }) => {
    this.search = search || []
    // If we are filtering by grandparents e.g. signatures of a resource,
    // We first note the children of those grandparents (i.e. all possible parents)
    // and filter by the parents instead
    if (filters!==undefined &&
        this.grandparent!==undefined &&
        filters[this.grandparent]!==undefined){
      let parents = filters[this.parent] || []
      for (const i of filters[this.grandparent]){
        parents = [...parents, ...this.grandparent_to_parent[i]]
      }
      filters = {
        ...filters,
        [this.parent]: parents
      }
      delete filters[this.grandparent]
    }
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

  fetch_parent_metadata = async (parent_ids) => {
    let unresolved_ids = []
    for (const pid of parent_ids){
      if (this.parents_meta[pid]=== undefined){
        if (unresolved_ids.indexOf(pid)==-1){
          unresolved_ids = [...unresolved_ids, pid]
        }
      }
    }

    const { response } = await fetch_meta_post({
      endpoint: `/${plural_mapper[this.parent]}/find`,
      body: {
        filter: {
          where: {
           id: {
              inq: unresolved_ids
            }
          },
        },
      },
    })

    for (const r of response){
      const parent_id = r["id"]
      this.parents_meta[parent_id] = r
    }

  }

  parse_bulk_result = async ({ operations, bulk_response }) => {
    const {
      metadata_search,
      value_count,
      count,
    } = operations
    let result = {}
    let response = bulk_response
    if (metadata_search) {
      const [m, ...r] = response
      // if (this.parent!==undefined){
      //   await this.fetch_parent_metadata(m.response)
      // }
      const res = m.response
      if (this.parent!==undefined){
        await this.fetch_parent_metadata(res.map(r=>r[this.parent]))
      }
      const updated_res = this.parent === undefined ? m.response :
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
        metadata_search: updated_res,
      }
    }
    if (value_count) {
      const [m, ...r] = response

      response = [...r]
      let value_count = {}
      for (const i of this.sorting_fields){
        if (i.meta.Parent_Meta===undefined || !i.meta.Parent_Meta){
          const field_name = i.meta.Field_Name
          value_count[field_name] = {
            schema: i,
            stats: Object.entries(m.response[field_name] || {}).reduce((acc_1,[key, val])=>{
              if (key!=="null" && val !== 0){
                acc_1[key] = val
              }
              return acc_1
            },{}),
          }
        }
      }
      let parents = {}
      if (this.parent !== undefined && m.response[this.parent]!== undefined) {
        parents = m.response[this.parent]
        await this.fetch_parent_metadata(Object.keys(parents))
        // const res = result["metadata_search"].map(r=>{
        //   const parent_id = r[this.parent]
        //   const parent_meta = this.parents_meta[parent_id]
        //   r[this.parent] = parent_meta
        //   return r
        // })
        // result = {
        //   ...result,
        //   metadata_search: res,
        // }
      }

      result = {
        ...result,
        value_count,
        parents,
        // value_count: this.sorting_fields.reduce((acc, s) => {
        //   const field_name = s.meta.Field_Name
        //   acc[field_name] = {
        //     schema: s,
        //     stats: Object.entries(m.response[field_name] || {}).reduce((acc_1,[key, val])=>{
        //       if (key==="null"){
        //         return acc_1
        //       }
        //       acc_1[key] = val
        //       return acc_1
        //     },{}),
        //   }
        //   return acc
        // }, {}),
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

  // This function fetches the grandparents metadata (provided that it is ever needed)
  // It also provides a mapping between parents and grandparents
  fetch_grandparents_meta = async(parent_ids) => {
    // Find grandparent ids
    let unresolved_parent_ids = []
    let unresolved_grandparent_ids = []
    for (const pid of parent_ids){
      if (this.parents_meta[pid]=== undefined){
        if (unresolved_parent_ids.indexOf(pid)==-1){
          unresolved_parent_ids = [...unresolved_parent_ids, pid]
        }
      }else {
        const grandparent_id = this.parents_meta[pid][this.grandparent]
        if (this.grandparents_meta[grandparent_id] === undefined){
          unresolved_grandparent_ids = [...unresolved_grandparent_ids, grandparent_id] 
        }
      }
    }
    if (unresolved_parent_ids.length>0){
      const { response: resolved_parents } = await fetch_meta_post({
        endpoint: `/${plural_mapper[this.parent]}/find`,
        body: {
          filter: {
            where: {
             id: {
                inq: unresolved_parent_ids
              }
            },
          },
        },
      })
      for (const parent of resolved_parents){
        const parent_id = parent.id
        const grandparent_id = parent[this.grandparent]
        this.parents_meta[parent_id] = parent
        if (this.grandparents_meta[grandparent_id] === undefined){
          unresolved_grandparent_ids = [...unresolved_grandparent_ids, grandparent_id] 
        }
      }
    }
    if (unresolved_grandparent_ids.length > 0) {
      const { response: resolved_grandparent } = await fetch_meta_post({
        endpoint: `/${this.grandparent_schema.meta.Grandparent_Table}/find`,
        body: {
          filter: {
            where: {
             id: {
                inq: unresolved_grandparent_ids
              }
            },
          },
        },
      })
      // Get grandparents meta
      for (const grandparent of resolved_grandparent){
        this.grandparents_meta[grandparent.id] = grandparent
      }
    }

    
    // Get a mapping of the parent to the respective grandparent and vice versa
    for (const [key,val] of Object.entries(this.parents_meta)){
      const grandparent_id = val[this.grandparent]
      this.parent_to_grandparent[key] = grandparent_id
      if (this.grandparent_to_parent[grandparent_id]===undefined){
        this.grandparent_to_parent[grandparent_id] = [key]
      }else {
        this.grandparent_to_parent[grandparent_id] = [...this.grandparent_to_parent[grandparent_id], key]
      }

    }
  }

  fetch_grandparent = async(parents=[]) => {
    // if (this.grandparents_meta === undefined){
    //   await this.fetch_grandparents_meta()
    // }
    // const { response } = await fetch_meta({
    //   endpoint: `/${this.grandparent_schema.meta.Parent_Table}/value_count`,
    //   body: {
    //     filter: {
    //       where: {
    //         id: {
    //           inq: Object.keys(parents)
    //         },
    //       },
    //       fields: [field]
    //     },
    //   },
    // })
    if (Object.keys(parents).length === 0){
      const { response } = await fetch_meta({
        endpoint: `/${this.table}/value_count`,
        body: {
          filter: {
            fields: [this.parent],
          },
        },
      })
      parents = response[this.parent]
    }
    console.log(parents)
    await this.fetch_grandparents_meta(Object.keys(parents))
    const grandparent_count = {}
    for (const [id,count] of Object.entries(parents)){
      const grandparent_id = this.parent_to_grandparent[id]
      if (grandparent_count[grandparent_id]===undefined){
        grandparent_count[grandparent_id] = count
      }else {
        grandparent_count[grandparent_id] = grandparent_count[grandparent_id] + count
      }
    }
    return {[this.grandparent]: grandparent_count}
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
    this.fields = []
    for (const i of sorting_fields){
      if (i.meta.Parent_Meta === undefined || !i.meta.Parent_Meta){
        this.fields = [...this.fields, i.meta.Field_Name]
      }
      if (i.meta.Parent_Meta){
        this.grandparent = i.meta.Field_Name
        this.grandparent_schema = i
        await this.fetch_grandparent()
      }
    }
    // If we are querying for the grandparent, make sure we know the parent
    if (this.grandparent!==undefined && this.fields.indexOf(this.parent)===-1)
      this.fields = [this.parent, ...this.fields]
    // this.fields = sorting_fields.map((i) => i.meta.Field_Name)
    this.sorting_fields = sorting_fields
  }

  fetch_meta = async (query_params, controller) => {
    if (this.fields === undefined && this.sorting_fields === undefined) {
      await this.get_value_count_fields()
    }
    // if (this.grandparent!==undefined && this.grandparents_meta === undefined){
    //   await this.fetch_grandparents_meta()
    // }
    const { params, operations } = this.build_query(query_params)
    const { response: bulk_response } = await fetch_meta_post({
      endpoint: '/bulk',
      body: params,
      signal: controller.signal,
    })
    const result = await this.parse_bulk_result({ operations, bulk_response })
    this.results = {
      metadata_search: result.metadata_search || this.results.metadata_search,
      value_count: result.value_count || this.results.value_count,
      count: result.count || this.results.count,
    }
    if (this.grandparent!==undefined && result.parents!==undefined){
      const response = await this.fetch_grandparent(result.parents)
      this.results.value_count[this.grandparent] = {
        schema: this.grandparent_schema,
        stats: Object.entries(response[this.grandparent] || {}).reduce((acc_1,[key, val])=>{
          if (key==="null"){
            return acc_1
          }
          acc_1[key] = val
          return acc_1
        },{}),
      }
    }
    return { table: this.table, model: this }
  }
}
