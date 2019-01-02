
export function call(func, ...bind_args) {
  return (...args) => func(...bind_args, ...args)
}
