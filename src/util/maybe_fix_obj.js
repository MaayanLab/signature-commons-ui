export function maybe_fix_obj(obj) {
  if (Array.isArray(obj))
    return obj
  return Object.keys(obj).map(
    (k) => ({...obj[k], id: k})
  )
}
