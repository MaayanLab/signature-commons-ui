import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const ShowMeta = dynamic(()=>import('./ShowMeta'));
const Collapse = dynamic(()=>import('@material-ui/core/Collapse'));
const CardContent = dynamic(()=>import('@material-ui/core/CardContent'));

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