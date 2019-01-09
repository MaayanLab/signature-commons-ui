import React from 'react'
import { Highlight } from './Highlight'
import { makeTemplate } from '../util/makeTemplate'
import MUIDataTable from 'mui-datatables'
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { ShowMeta } from './ShowMeta'

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

export function Table({items, highlight, visibility}) {
  const matched_schemas = schemas.filter(
    (schema) => objectMatch(schema.match, items[0])
  )
  if(matched_schemas.length < 1) {
    console.error('Could not match ui-schema for item', items)
    return null
  }
  const schema = matched_schemas[0]
  const cols = Object.keys(schema.properties).map(
    (prop) => ({
      name: prop,
      options: {
        filter: schema.properties[prop].visibility >= visibility,
        customBodyRender: (val, tableMeta, updateValue) => {
          return labels[schema.properties[prop].type]({
            label: prop,
            prop: schema.properties[prop],
            data: val,
            highlight: highlight,
          })
        }
      }
    })
  )
  const data = items.map((item) => cols.map((col) => item[col] || ''))
  const options = {
    filter: true,
    filterType: 'dropdown',
    responsive: 'scroll',
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      return (
        <TableRow>
          <TableCell colSpan={rowData.length}>
            <ShowMeta
              value={items[rowMeta.rowIndex]}
              highlight={highlight}
            />
          </TableCell>
        </TableRow>
      )
    },
  }
  return (
    <MUIDataTable
      options={options}
      data={data}
      columns={cols}
    />
  )
}
