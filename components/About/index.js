import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

export default class About extends React.PureComponent {
    render() {
        console.log(this.props.ui_values.about)
        return(
            <Grid container style={{marginTop: 50, marginBottom: 200}}>
                <Grid row xs={12} style={{marginBottom: 20}}>
                    <Typography variant={"h5"}>
                        About
                    </Typography>
                </Grid>
                <Grid xs={12} md={4} row>
                    <img alt="about" {...this.props.ui_values.about.image}/>
                </Grid>
                <Grid xs={12} md={8} row>
                    <Typography variant={"body1"}>
                        {this.props.ui_values.about.text}
                    </Typography>
                </Grid>
            </Grid>
        )
    }
}