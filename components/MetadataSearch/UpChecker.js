import React from 'react'
import Chip from '@material-ui/core/Chip'
import Icon from '@material-ui/core/Icon'
import { fetch_external } from "../../util/fetch/fetch_external";
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

export default class UpChecker extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            up: "Loading...",
            style: {}

        }

    }
    componentDidMount = async () => {
        const {response} = await fetch_external({
            endpoint: `/api?url=${this.props.url}`,
        })
        this.setState({
            up: response.status,
            style: {
                background: response.status === "yes"? green[300]: red[200]
            }
        })
    }

    render = () => {
        const {classes} = this.props
        return(
            <Chip
                className={classes.chip}
                key={"up"}
                style={this.state.style}
                avatar={<Icon className={`${classes.icon} mdi ${this.state.up==="yes"? "mdi-cloud": "mdi-cloud-alert"} mdi-18px`} />}
                label={<span>Status: {this.state.up==="yes"?"Online": this.state.up}</span>}
            />
        )
    }
}