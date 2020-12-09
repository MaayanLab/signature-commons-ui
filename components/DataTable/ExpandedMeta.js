import React from 'react'
import Grid from '@material-ui/core/Grid'
import ShowMeta from './ShowMeta'
import Collapse from '@material-ui/core/Collapse'
import CardContent from '@material-ui/core/Collapse'
import PropTypes from 'prop-types'

export const ExpandedMeta = ({expanded, data, highlight, props}) => {
    return (
    <Collapse in={expanded} timeout="auto" unmountOnExit >
        <CardContent style={{height:"100%", padding: 10, visibility: expanded ? 'visible': 'hidden' }}>
            <Grid
            container
            direction="row"
            >
                <Grid item xs={12}>
                    <ShowMeta
                    value={[
                        {
                        // '@id': props.data.id,
                        // '@name': props.data.processed.name.text,
                        'meta': data.meta,
                        },
                    ]}
                    highlight={highlight}
                    />
                </Grid>
            </Grid>
        </CardContent>
    </Collapse>
    )
}

ExpandedMeta.propTypes = {
    expanded: PropTypes.bool,
    data: PropTypes.shape({
        id: PropTypes.string,
        meta: PropTypes.object
    }),
    highlight: PropTypes.arrayOf(PropTypes.string)
}