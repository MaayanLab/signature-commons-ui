import React from 'react'
import { Highlight } from './Highlight'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import { landingStyle } from '../styles/jss/theme.js'

export function ShowMeta({ value, highlight, classes }) {
  if (typeof(value) === 'string' || typeof(value) === 'number' || typeof(value) === 'boolean') {
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
              Component={(props) => <b {...props}>{props.children}</b>}
              HighlightComponent={(props) => <i {...props}>{props.children}</i>}
              text={value['@type'] + ' (' + value['@id'] + '):'}
              highlight={highlight}
            />
          </Grid>
          <Grid item xs={12}>
            <ShowMeta classes={classes} value={value.meta} highlight={highlight} />
          </Grid>
        </Grid>
      )
    }
    return (
      <div>
        {Object.keys(value).filter((key) => !key.startsWith('$')).sort().map((key, ind) => (
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
