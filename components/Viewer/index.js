import React from 'react'
import IFrame from '../IFrame'
import { fetch_external } from '../../util/fetch/fetch_external'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'


export default class Viewer extends React.PureComponent {
    
    render = () => {

        return (
            <Grid container
                justify="center"
            >
                <Grid item>
                    <IFrame
                        iframe
                        id="network-iframe"
                        frameBorder="0"
                        height={1000}
                        width={1500}
                        src={`${process.env.PREFIX}/static/webview/build/index.html`}
                    />
                </Grid>
            </Grid>
        )
    }
}