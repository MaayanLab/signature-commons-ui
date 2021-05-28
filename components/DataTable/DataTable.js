import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const InfoCard = dynamic(async () => (await import('./InfoCard')).InfoCard);

export const DataTable = (props) => {
    const {TopComponents=[],
        BottomComponents=[],
        InfoCardComponent=InfoCard,
        onChipClick,
        activeIcon=true,
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
                null:
                entries.map(entry=>(
                    <InfoCardComponent key={entry.data.id}
                        activeIcon={activeIcon}
                        {...entry}
                        onChipClick={onChipClick}/>
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