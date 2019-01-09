import React from 'react'
import { Highlight } from './Highlight'
import { makeTemplate } from '../util/makeTemplate'

const schemas = [
  require('../ui-schemas/dataset/lincs.json'),
  require('../ui-schemas/dataset/creeds.json'),
  require('../ui-schemas/dataset/enrichr.json'),
  require('../ui-schemas/library/lincs.json'),
  require('../ui-schemas/library/creeds.json'),
  require('../ui-schemas/library/enrichr.json'),
  require('../ui-schemas/signature/lincs.json'),
  require('../ui-schemas/signature/creeds.json'),
  require('../ui-schemas/signature/enrichr.json'),
]

const labels = {
  'text': ({label, prop, data, highlight}) => (
    <Highlight
      text={label + ': ' + makeTemplate(prop.text, data)}
      highlight={highlight}
      props={{
        className: "chip"
      }}
    />
  ),
  'header-img': ({label, prop, data, highlight}) => (
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
          alt={prop.alt}
          src={prop.src}
          style={{
            ...{
              maxWidth: '100px',
              maxHeight: '150px',
            },
            ...prop.style
          }}
        />
      </div>
      <Highlight
        Component={(props) => <span {...props}>{props.children}</span>}
        text={prop.alt}
        highlight={highlight}
      />
    </div>
  ),
  'img': ({label, prop, data, highlight}) => (
    <div className="chip">
      <img
        alt={prop.alt}
        src={prop.src}
      />
      <Highlight
        Component={(props) => <span {...props}>{props.children}</span>}
        text={prop.alt}
        highlight={highlight}
      />
    </div>
  ),
}

function objectMatch(m, o) {
  if(m === undefined)
    return true
    
  for(const k of Object.keys(m)) {
    const K = makeTemplate(k, o)
    if (typeof m[k] === 'string') {
      const V = makeTemplate(m[k], o)
      if (K !== V)
        return false
    } else if (typeof m[k] === 'object') {
      if (m[k]['ne'] !== undefined) {
        if ((m[k]['ne'] === null && K !== undefined) || K === m[k]['ne'])
          return false
      } else {
        throw new Error(`'Operation not recognized ${JSON.stringify(m[k])} ${JSON.stringify(m)} ${JSON.stringify(o)}`)
      }
    }
  }
  return true
}

export function Label({item, highlight, visibility}) {
  const matched_schemas = schemas.filter(
    (schema) => objectMatch(schema.match, item)
  )
  if(matched_schemas.length < 1) {
    console.error('Could not match ui-schema for item', item)
    return null
  }
  const schema = matched_schemas[0]
  return (
    <div>
      {Object.keys(schema.properties).filter(
        (prop) => schema.properties[prop].visibility >= visibility && objectMatch(schema.properties[prop].condition, item)
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
