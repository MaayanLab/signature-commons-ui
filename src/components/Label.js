import React from 'react'
import { Highlight } from './Highlight'
import { makeTemplate } from '../util/makeTemplate'

const schemas = [
  require('../ui-schemas/dataset/connectivitymap.json'),
  require('../ui-schemas/dataset/creeds.json'),
  require('../ui-schemas/dataset/enrichr.json'),
  require('../ui-schemas/library/connectivitymap.json'),
  require('../ui-schemas/library/creeds.json'),
  require('../ui-schemas/library/enrichr.json'),
  require('../ui-schemas/signature/connectivitymap.json'),
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
  'img': ({label, prop, data, highlight}) => (
    <div className="chip">
      <img
        alt={prop.alt}
        src={prop.src}
        style={prop.style}
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
    if(o[K] !== m[K])
      return false
  }
  return true
}

export function Label({item, highlight, visibility}) {
  const matched_schemas = schemas.filter(
    (schema) => objectMatch(schema.match, item)
  )
  console.log(matched_schemas)
  if(matched_schemas.length < 1)
    return null
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
