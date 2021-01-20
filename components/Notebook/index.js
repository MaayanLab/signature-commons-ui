import React from 'react'
import IFrame from '../IFrame'
import Grid from '@material-ui/core/Grid'


export default class Notebook extends React.PureComponent {
    
    render = () => {

        return (
            <Grid container
                justify="center"
            >
                <Grid item xs={12}>
                    <IFrame
                        iframe
                        id="notebook-iframe"
                        frameBorder="0"
                        height={32100}
                        src={`${process.env.PREFIX}/static/notebook/2021-01-19-all-figures.html`}
                    />
                </Grid>
            </Grid>
        )
    }
}