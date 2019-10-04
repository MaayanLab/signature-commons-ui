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
  for_count,
  skip,
  limit,
}) => {
  if (filters!==undefined || skip!== undefined || limit!==undefined){
    return JSON.stringify({
      search,
      [current_table]: {
        skip,
        limit,
        filters
      }
    })
  }else{
    return JSON.stringify({
      search
    })
  }
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
        [reverse_preferred_name[k]]: v
      }
    }
  }
  return {...params}
}