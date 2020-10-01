import React from 'react'
import Grid from '@material-ui/core/Grid'
import ShowMeta from '../ShowMeta'

export const ExpandedMeta = (props) => (
  <Grid
    container
    direction="row"
  >
    <Grid item xs={12}>
      <ShowMeta
        value={[
          {
            // '@id': props.data.original.id,
            // '@name': props.data.processed.name.text,
            'meta': props.data.original.meta,
          },
        ]}
        highlight={props.search}
      />
    </Grid>
  </Grid>
)
