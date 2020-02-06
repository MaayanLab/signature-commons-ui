import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

export default class About extends React.PureComponent {
    render() {
        console.log(this.props.ui_values.about)
        return(
            <Grid container>
                <Grid xs={12} m={4} row>
                    <img alt="about" {...this.props.ui_values.about.image}/>
                </Grid>
                <Grid xs={12} m={8} row>
                    <Typography variant={"body1"}>
                        {this.props.ui_values.about.text}
                    </Typography>
                </Grid>
            </Grid>
        )
    }
}