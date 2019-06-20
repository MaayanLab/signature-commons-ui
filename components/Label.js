import React from 'react'
import { Highlight } from './Highlight'
import { makeTemplate } from '../util/makeTemplate'

export const schemas = [
  require('../ui-schemas/dataset/lincs.json'),
  require('../ui-schemas/dataset/creeds.json'),
  require('../ui-schemas/dataset/enrichr.json'),
  require('../ui-schemas/library/lincs.json'),
  require('../ui-schemas/library/creeds.json'),
  require('../ui-schemas/library/mcf10a.json'),
  require('../ui-schemas/library/enrichr.json'),
  require('../ui-schemas/signature/lincs.json'),
  require('../ui-schemas/signature/creeds.json'),
  require('../ui-schemas/signature/enrichr.json'),
  require('../ui-schemas/signature/mcf10a.json'),
  require('../ui-schemas/entities/sigcom.json'),
]

export const default_schemas = [
  require('../ui-schemas/library/default.json'),
  require('../ui-schemas/signature/default.json'),
  require('../ui-schemas/entities/default.json'),
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
    const K = makeTemplate(k, o)
    if (typeof m[k] === 'string') {
      const V = makeTemplate(m[k], o)
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

export function Label({ item, highlight, visibility }) {
  let matched_schemas = schemas.filter(
      (schema) => objectMatch(schema.match, item)
  )
  // default if there is no match
  if (matched_schemas.length<1) {
    matched_schemas = default_schemas.filter(
      (schema) => objectMatch(schema.match, item)
    )
    console.log(matched_schemas)
  }
  if (matched_schemas.length < 1) {
    console.error('Could not match ui-schema for item', item)
    return null
  }
  const schema = matched_schemas[0]
  return (
    <div>
      {Object.keys(schema.properties).filter(
          (prop) => {
            return (schema.properties[prop].visibility >= visibility && objectMatch(schema.properties[prop].condition, item))
          }
      ).map((label) => (
        <span key={label}>
          {labels[schema.properties[label].type]({
            label: label,
            prop: schema.properties[label],
            data: item,
            highlight: highlight,
          })}
        </span>
      ))}
    </div>
  )
}

export default Label
