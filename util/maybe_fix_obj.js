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
