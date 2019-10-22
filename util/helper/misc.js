import { Set } from 'immutable'

export function get_formated_query(terms) {
  if (Array.isArray(terms)) {
    if (terms.length === 0) {
      return ''
    }
    return `?q=${terms.join('%26')}`
  } else if (typeof terms === 'string') {
    return `?q=${terms}`
  } else {
    return `?q=${Object.keys(terms).join('%26')}`
  }
}


export function parse_entities(input) {
  return Set(input.toUpperCase().split(/[ \t\r\n;]+/).reduce(
      (lines, line) => {
        const parsed = /^(.+?)(,(.+))?$/.exec(line)
        if (parsed !== null) {
          return [...lines, parsed[1]]
        }
        return lines
      }, []
  ))
}

export function maybe_fix_obj(obj) {
  if (Array.isArray(obj)) {
    return obj.reduce((objs, v) => {
      if (v.id !== undefined) {
        objs[v.id] = v
      } else if (v.uuid !== undefined) {
        objs[v.uuid] = v
        objs[v.uuid].id = v.uuid
        delete objs[v.uuid].uuid
      }
      return objs
    }, {})
  }
  return Object.keys(obj).reduce((objs, k) => ({ ...objs, [k]: { ...obj[k], id: k } }), {})
}

export const diffList = (prevList, currList) =>{
  if (prevList.length !== currList.length) return true
  const diff = prevList.filter(s=>currList.indexOf(s)===-1)
  if (diff.length>0) return true
  return false
}

// What it should do:
// 1. Modify where clause via searchbox
// 2. Add filter (parent and meta) (parents for now)
// 3. Add pages
export const URLFormatter = ({
  current_table,
  search,
  filters, // dictionary where the key is the field and the value is the filter values
  skip,
  limit,
  order,
  params_str,
  reverse_preferred_name,
  value_count_params
}) => {
  if (params_str===undefined) params_str = '{}'
  if (reverse_preferred_name===undefined) reverse_preferred_name = {"Libraries": "libraries", "Signatures": "signatures"}
  let params = ReadURLParams(params_str, reverse_preferred_name)
  if(params[current_table]!==undefined){
    params = {
      ...params,
      search,
      [current_table]: {
        ...params[current_table],
        filters: filters || params[current_table].filters,
        skip: skip || params[current_table].skip,
        order: order || params[current_table].order,
        limit: limit || params[current_table].limit,
        value_count_params: filters || params[current_table].value_count_params,
      }
    }
  }else if (filters || skip || limit || order || value_count_params){
    params = {
      ...params,
      search,
      [current_table]: {
        filters,
        skip,
        limit,
        value_count_params,
        order,
      }
    }
  } else {
    params = {
      ...params,
      search
    }
  }
  return JSON.stringify({
      ...params,
    })
}

export const ReadURLParams = (params_str, reverse_preferred_name) => {
  const searchParams = new URLSearchParams(params_str);
  const p = JSON.parse(searchParams.get("q"))
  const {search, ...rest} = p || {search:[]}
  let params = {search}
  for (const [k,v] of Object.entries(reverse_preferred_name)){
    if (rest[k]!==undefined) {
      params = {
        ...params,
        [reverse_preferred_name[k]]: rest[k]
      }
    }
  }
  return {...params}
}