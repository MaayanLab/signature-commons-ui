import { Set } from 'immutable'

export function get_formated_query(terms) {
  if (Array.isArray(terms)) {
    if (terms.length === 0) {
      return ''
    }
    return `?query=${terms.join('%26')}`
  } else if (typeof terms === 'string') {
    return `?query=${terms}`
  } else {
    return `?query=${Object.keys(terms).join('%26')}`
  }
}

export const modify_entity_by_strategy = {
  'upper': (input) => (
    input.toUpperCase()
  ),
  'lower': (input) => (
    input.toLowerCase()
  ),
  'none': (input) => (
    input
  ),
}

export function parse_entities(entities, strategy = 'upper') {
  const new_entities = {}
  for (const entity of entities) {
    const parsed = /^(.+?)(,(.+))?$/.exec(entity)
    if (parsed !== null) {
      new_entities[modify_entity_by_strategy[strategy](parsed[1])] = entity
    }
  }
  return new_entities
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

export const diffList = (prevList, currList) => {
  if (prevList.length !== currList.length) return true
  const diff = prevList.filter((s) => currList.indexOf(s) === -1)
  if (diff.length > 0) return true
  return false
}

// What it should do:
// 1. Modify where clause via searchbox
// 2. Add filter (parent and meta) (parents for now)
// 3. Add pages
export const URLFormatter = ({
  preferred_name,
  params,
}) => {
  const { search, ...rest } = params
  const params_preferred = { search }
  for (const i in preferred_name) {
    if (rest[i] !== undefined) {
      params_preferred[preferred_name[i]] = rest[i]
    }
  }
  return JSON.stringify({
    ...params_preferred,
  })
}

export const ReadURLParams = (params_str, reverse_preferred_name) => {
  const searchParams = new URLSearchParams(params_str)
  const p = JSON.parse(searchParams.get('q'))
  const { search, ...rest } = p || { search: [] }
  let params = { search }
  for (const k in reverse_preferred_name) {
    if (rest[k] !== undefined) {
      params = {
        ...params,
        [reverse_preferred_name[k]]: rest[k],
      }
    }
  }
  return { ...params }
}
