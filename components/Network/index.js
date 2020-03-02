import React from 'react'
import IFrame from '../IFrame'
import { fetch_external } from '../../util/fetch/fetch_external'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'


export default class Network extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            url: null
        }
    }
    
    componentDidMount = async() => {
        const {response} = await fetch_external({
            endpoint: "/network"
        })
        this.setState({
            url: response.url
        })
    }

    render = () => {
        if (this.state.url === null){
            return <CircularProgress />
        }

        return (
            <Grid container>
                <Grid item xs={12} md={10}>
                    <IFrame
                        iframe
                        id="network-iframe"
                        frameBorder="0"
                        height={700}
                        src={this.state.url}
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <Grid container direction={"column"} style={{marginLeft: 10}}>
                        <Grid item>
                            <img src="https://amp.pharm.mssm.edu/mcf10a-notebooks/app/static/R/networks/network_legend.png"
                                style={{height: 300}}
                            ></img>
                        </Grid>
                        <Grid item>
                            <Typography variant={"body1"}>
                                To pan the network, hold the mouse down until a gray circle is added to the tooltip.
                            </Typography>
                            <Typography variant={"body1"}>
                                <a href={this.state.url}>Click here</a> for a full-screen view of this network
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}