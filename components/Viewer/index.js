import React from 'react'
import IFrame from '../IFrame'
import Grid from '@material-ui/core/Grid'


export default class Viewer extends React.PureComponent {
    
    render = () => {

        return (
            <Grid container
                justify="center"
            >
                <Grid item xs={12} style={{background:"#FFF", marginBottom: 10}}>
                    <IFrame
                        iframe
                        id="viewer-iframe"
                        frameBorder="0"
                        height={2000}
                        src={`${process.env.PREFIX}/static/webview/build/index.html`}
                    />
                </Grid>
            </Grid>
        )
    }
}