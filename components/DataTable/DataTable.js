import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import { InfoCard } from './InfoCard';
import { Typography } from '@material-ui/core';

export const DataTable = (props) => {
    const {TopComponents=[],
        BottomComponents=[],
        InfoCardComponent=InfoCard,
        onChipClick,
        entries} = props
    return(
        <Grid container>
            {TopComponents.map(comp=>{
                const {component,
                    GridProps={},
                    props
                } = comp
                return(
                    <Grid item {...GridProps}>
                        {component(props)}
                    </Grid>
                )
            })}
            <Grid item style={{width:"100%"}}>
                {typeof entries === 'undefined' || entries.length == 0 ?
                <Typography variant="h5" >No entries</Typography>:
                entries.map(entry=>(
                    <InfoCardComponent key={entry.data.id} {...entry} onChipClick={onChipClick}/>
                ))}
            </Grid>
            {BottomComponents.map(comp=>{
                const {component,
                    GridProps={},
                    props
                } = comp
                return(
                    <Grid item {...GridProps}>
                        {component(props)}
                    </Grid>
                )
            })}
        </Grid>
    )
}

DataTable.propTypes = {
    // See prop types of InfoCard
    entries: PropTypes.arrayOf(PropTypes.object),
    onChipClick: PropTypes.func,
    InfoCardComponent: PropTypes.node,
    TopComponents: PropTypes.shape({
        component: PropTypes.func,
        props: PropTypes.object
    }),
    BottomComponents: PropTypes.shape({
        component: PropTypes.func,
        props: PropTypes.object
    })
}