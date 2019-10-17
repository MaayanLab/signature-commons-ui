import React from 'react'
import { Highlight } from './Highlight'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography';

import { landingStyle } from '../styles/jss/theme.js'

function validURL(str) {
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

export function ShowMeta({ value, highlight, classes }) {
  if (typeof(value) === 'string' || typeof(value) === 'number' || typeof(value) === 'boolean') {
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
        spacing={24}>
        {value.map((value, ind) => (
          <Grid item xs={12} key={ind}>
            <ShowMeta classes={classes} value={value} highlight={highlight} />
          </Grid>
        ))}
      </Grid>
    )
  } else if (typeof value === 'object') {
    if (value['@id'] !== undefined && value['@type'] !== undefined && value.meta !== undefined) {
      return (
        <Grid container
          spacing={24}>
          <Grid item xs={12}>
            <Highlight
              Component={(props) => <Typography variant={"h5"} {...props}>{props.children}</Typography>}
              HighlightComponent={(props) => <i {...props}>{props.children}</i>}
              text={value['@type'] + ' (' + value['@id'] + ')'}
              highlight={highlight}
            />
          </Grid>
          <Grid item xs={12}>
            <ShowMeta classes={classes} value={value.meta} highlight={highlight} />
          </Grid>
        </Grid>
      )
    } else if (value['@id'] !== undefined && value['@name'] !== undefined && value.meta !== undefined) {
      return (
        <Grid container
          spacing={24}>
          <Grid item xs={12}>
            <Highlight
              Component={(props) => <Typography variant={"h5"} {...props}>{props.children}</Typography>}
              HighlightComponent={(props) => <i {...props}>{props.children}</i>}
              text={value['@name']}
              highlight={highlight}
            />
            <Highlight
              Component={(props) => <Typography variant={"subtitle1"} {...props}>{props.children}</Typography>}
              HighlightComponent={(props) => <i {...props}>{props.children}</i>}
              text={value['@id']}
              highlight={highlight}
            />
          </Grid>
          <Grid item xs={12}>
            <ShowMeta classes={classes} value={value.meta} highlight={highlight} />
          </Grid>
        </Grid>
      )
    }
    if (value['Description'] !== undefined) {
      const { Description, ...rest } = value
      value = { Description, ...rest }
    } else if (value['description'] !== undefined) {
      const { description, ...rest } = value
      value = { description, ...rest }
    }
    return (
      <div>
        {Object.keys(value).filter((key) => (!key.startsWith('$') && key.toLowerCase() !== 'icon')).map((key, ind) => (
          <Grid container
            spacing={24}
            key={key}>
            <Grid item xs={6} xl={2} md={3} className={classes.KeyLabel} style={{ 'textAlign': 'right' }}>
              <Highlight
                Component={(props) => <b {...props}>{props.children}</b>}
                HighlightComponent={(props) => <i {...props}>{props.children}</i>}
                text={key.replace(/_/g, ' ')}
                highlight={highlight}
              />
            </Grid>
            <Grid item xs={6} xl={10} md={9}>
              <ShowMeta classes={classes} value={value[key]} highlight={highlight} />
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

export default withStyles(landingStyle)(ShowMeta)
