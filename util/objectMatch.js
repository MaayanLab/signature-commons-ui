import { makeTemplate } from './makeTemplate'

export const default_schemas = [
  require('../examples/resources/default.json'),
  require('../examples/library/default.json'),
  require('../examples/signature/default.json'),
  require('../examples/signature/default_rank.json'),
  require('../examples/entities/default.json'),
]

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

export function findMatchedSchema(item, schemas) {
  const schemas_with_default = [...schemas, ...default_schemas]
  const matched_schemas = schemas_with_default.filter(
      (schema) => objectMatch(schema.match, item)
  )
  if (matched_schemas.length < 1) {
    console.error('Could not match ui-schema for item', item)
    return null
  } else return matched_schemas[0]
}
