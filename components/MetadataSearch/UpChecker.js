import React from 'react'
import Chip from '@material-ui/core/Chip'
import Icon from '@material-ui/core/Icon'
import { fetch_external } from "../../util/fetch/fetch_external";

export default class UpChecker extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            up: "Loading..."
        }

    }
    componentDidMount = async () => {
        const {response} = await fetch_external({
            endpoint: `/api?url=${this.props.url}`,
        })
        this.setState({
            up: response.status
        })
    }

    render = () => {
        const {classes} = this.props
        return(
            <Chip
                className={classes.chip}
                key={"up"}
                avatar={<Icon className={`${classes.icon} mdi ${this.state.up==="yes"? "mdi-cloud": "mdi-cloud-alert"} mdi-18px`} />}
                label={<span>Up: {this.state.up}</span>}
            />
        )
    }
}