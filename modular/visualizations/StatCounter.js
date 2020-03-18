import React from 'react'
import PropTypes from 'prop-types'
import { validURL } from "../../util/helper/ui_functions"

export default class StatCounter extends React.Component {
    CountEntity = (props) => {
        const icon = props.entry.icon !== undefined ? props.entry.icon: "mdi-arrow-top-right-thick"
        return (
            <React.Fragment style={{textAlign: "center"}}>
                { validURL(icon) ? 
                    <img src={icon} alt={entry.name} height={36}/>:
                    <span className={`mdi ${entry.icon} mdi-36px`}/>
                }
                <Typography variant="subheading">
                    {entry.count}
                </Typography>
                <Typography variant="caption">
                    {entry.name}
                </Typography>
            </React.Fragment>
        )
    }

    render = () => {
        const { entries } = this.props
        let sm = entries.length < 4? 12/ entries.length: 3
        let xs = entries.length < 4? 12/ entries.length: 4
        const md = 2
        const EntryComponents = entries.map(entry=>{
            <Grid item xs={xs} sm={sm} md={md}>
                {this.CountEntity(entry)}
            </Grid>
        })
        return (
            <Grid container
                spacing={24}
                alignItems={'center'}
                justify={'center'}>
                {EntryComponents}        
            </Grid>
        )
    }
}

StatCounter.propTypes = {
    entries: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
            icon: PropTypes.string
        })
    ),
}