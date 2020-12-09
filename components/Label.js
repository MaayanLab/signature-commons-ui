import React from 'react'
import { Highlight } from './Highlight'
import { makeTemplate } from '../util/ui/makeTemplate'

export const default_schemas = [
  require('../examples/library/default.json'),
  require('../examples/signature/default.json'),
  require('../examples/entities/default.json'),
]

export const labels = {
  'text': ({ label, prop, data, highlight }) => {
    const val = makeTemplate(prop.text, data)
    if (val === 'undefined') {
      return null
    } else {
      return (
        <Highlight
          text={label + ': ' + makeTemplate(prop.text, data)}
          highlight={highlight}
          props={{
            className: 'chip grey white-text',
          }}
        />
      )
    }
  },
  'object': ({ label, prop, data, highlight }) => {
    const val = makeTemplate(prop.text, data, prop.subfield)
    if (val === 'undefined') {
      return null
    } else {
      return (
        <Highlight
          text={label + ': ' + val}
          highlight={highlight}
          props={{
            className: 'chip grey white-text',
          }}
        />
      )
    }
  },
  'header-img': ({ label, prop, data, highlight }) => (
    <div
      className="card-title"
    >
      <div
        className="card-image"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '150px',
        }}
      >
        <img
          alt={makeTemplate(prop.alt, data)}
          src={makeTemplate(prop.src, data)}
          style={{
            ...{
              maxWidth: '100px',
              maxHeight: '150px',
            },
            ...prop.style,
          }}
        />
      </div>
      <Highlight
        Component={(props) => <span {...props}>{props.children}</span>}
        text={makeTemplate(prop.alt, data)}
        highlight={highlight}
      />
    </div>
  ),
  'img': ({ label, prop, data, highlight }) => (
    <div className="chip grey white-text">
      <img
        alt={makeTemplate(prop.alt, data)}
        src={makeTemplate(prop.src, data)}
      />
      <Highlight
        Component={(props) => <span {...props}>{props.children}</span>}
        text={makeTemplate(prop.alt, data)}
        highlight={highlight}
      />
    </div>
  ),
  'text-default': ({ label, prop, data, highlight }) => {
    const val = makeTemplate(prop.text, data)
    if (val === 'undefined') {
      return null
    } else {
      return (
        <Highlight
          text={makeTemplate(prop.text, data)}
          highlight={highlight}
          props={{
            className: 'chip grey white-text',
          }}
        />
      )
    }
  },
}

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

export function Label({ item, highlight, visibility, schemas }) {
  let matched_schemas = schemas.filter(
      (schema) => objectMatch(schema.match, item)
  )
  // default if there is no match
  if (matched_schemas.length < 1) {
    matched_schemas = default_schemas.filter(
        (schema) => objectMatch(schema.match, item)
    )
  }
  if (matched_schemas.length < 1) {
    console.error('Could not match ui-schema for item', item)
    return null
  }
  const schema = matched_schemas[0]
  const img_keys = Object.keys(schema.properties).filter((key) => (matched_schemas[0].properties[key].type === 'img'))
  if (img_keys.length > 0) {
    const { [img_keys[0]]: img, ...rest } = schema.properties
    schema.properties = { [img_keys[0]]: img, ...rest }
  }
  const sorted_entries = Object.entries(schema.properties).sort((a, b) => a[1].priority - b[1].priority)
  return (
    <div>
      {sorted_entries.filter(
          (entry) => {
            return (entry[1].visibility >= visibility && objectMatch(entry[1].condition, item))
          }
      ).map((entry) => (
        <span key={entry[0]}>
          {labels[entry[1].type]({
            label: entry[0],
            prop: entry[1],
            data: item,
            highlight: highlight,
          })}
        </span>
      ))}
    </div>
  )
}

export default Label
