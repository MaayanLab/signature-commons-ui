import { makeTemplate } from "./makeTemplate"

export function objectMatch(m, o) {
  if (m === undefined) {
    return true
  }
  for (const k of Object.keys(m)) {
    let K
    try {
      K = makeTemplate(k, o)
    } catch {
      return (false)
    }
    if (typeof m[k] === 'string') {
      let V
      try {
        V = makeTemplate(m[k], o)
      } catch {
        return (false)
      }
      if (K.match(RegExp(V)) === null) {
        return false
      }
    } else if (typeof m[k] === 'object') {
      if (m[k]['ne'] !== undefined) {
        if (m[k]['ne'] === K) {
          return false
        }
      } else {
        throw new Error(`'Operation not recognized ${JSON.stringify(m[k])} ${JSON.stringify(m)} ${JSON.stringify(o)}`)
      }
    }
  }
  return true
}