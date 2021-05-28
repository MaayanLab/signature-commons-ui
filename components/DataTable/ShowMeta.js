import React from 'react'
import {precise} from '../ScorePopper'

import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Highlight = dynamic(async () => (await import('./Highlight')).Highlight);

export function validURL(str) {
    try {
      new URL(str)
    } catch {
      return false
    }
    return true
  }
  
  function validAccession(str) {
    return str.match(RegExp('^[A-Za-z]+:([A-Za-z]+:)?[A-Za-z0-9]+$'))
  }
  
  export function ShowMeta({ value, highlight, hidden }) {
    // if (value.meta!==undefined) value = value.meta
    if (hidden === undefined) hidden = []
    if (typeof value === 'number') {
      return (
        <Highlight
          Component={(props) => <span {...props}>{props.children}</span>}
          text={precise(value) + ''}
          highlight={highlight}
        />
      )
    }else if (typeof(value) === 'string' || typeof(value) === 'boolean') {
      if (validURL(value)) {
        if (! validAccession(value)) {
          return (
            <Highlight
              Component={(props) => <a href={value} {...props}>{value}</a>}
              text={value + ''}
              highlight={highlight}
            />
          )
        }
      }
      return (
        <Highlight
          Component={(props) => <span {...props}>{props.children}</span>}
          text={value + ''}
          highlight={highlight}
        />
      )
    } else if (Array.isArray(value)) {
      return (
        <Grid container
          spacing={3}>
          {value.map((value, ind) => (
            <Grid item xs={12} key={ind}>
              <ShowMeta hidden={hidden} value={value} highlight={highlight} />
            </Grid>
          ))}
        </Grid>
      )
    } else if (typeof value === 'object' && value !== null) {
      if (value['Description'] !== undefined) {
        const { Description, ...rest } = value
        value = { Description, ...rest }
      } else if (value['description'] !== undefined) {
        const { description, ...rest } = value
        value = { description, ...rest }
      }
      return (
        <div>
          {Object.keys(value).filter((key) => (!key.startsWith('$') && key.toLowerCase() !== 'icon' && key!== 'extraProperties' && key!== '@type' && hidden.indexOf(value[key])===-1)).map((key, ind) => (
            <Grid container
              spacing={3}
              key={key}>
              <Grid item xs={6} lg={4} md={5} style={{ 
                textAlign: 'left',
                borderRight: 'solid #c9c9c9',
                borderWidth: '1px', 
              }}>
                <Highlight
                  Component={(props) => <b {...props}>{props.children}</b>}
                  HighlightComponent={(props) => <i {...props}>{props.children}</i>}
                  text={key.replace(/_/g, ' ')}
                  highlight={highlight}
                />
              </Grid>
              <Grid item xs={6} lg={8} md={7}>
                <ShowMeta hidden={hidden} value={value[key]} highlight={highlight} />
              </Grid>
            </Grid>
          ))}
        </div>
      )
    } else {
      console.error(value)
      return null
    }
  }
  
export default ShowMeta