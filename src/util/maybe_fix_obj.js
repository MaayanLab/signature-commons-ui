export function maybe_fix_obj(obj) {
  if (Array.isArray(obj))
    return obj.reduce((objs, v) => ({...objs, [v.id]: v}), {})
  return Object.keys(obj).reduce((objs, k) => ({...objs, [k]: {...obj[k], id: k}}), {})
}
