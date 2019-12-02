import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import grey from '@material-ui/core/colors/grey'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Color from 'color'
import { connect } from 'react-redux'

import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    background: theme.palette.default.main,
  },
  footer_links: {
    color: theme.palette.default.contrastText,
  },
});

const FooterLink = ({src, alt, href, title, classes, containerProps, imageProps}) => {
  if (href){
    return(
      <Button href={href} style={{width: 200}} {...containerProps}>
        <Grid container align={"center"}>
          <Grid item xs>
            <img src={`${process.env.PREFIX}${src}`} alt={alt||title} style={{width: 200}} {...imageProps}/>
          </Grid>
          <Grid item xs>
            <Typography variant="caption" className={classes.footer_links}>{title}</Typography>
          </Grid>
        </Grid>
      </Button>
    )
  }else {
    return(
      <Paper href={href} elevation={0} style={{width: 200, background:"inherit"}} {...containerProps}>
        <Grid container align={"center"}>
          <Grid item xs>
            <img src={`${process.env.PREFIX}${src}`} alt={alt||title} style={{width: 200}} {...imageProps}/>
          </Grid>
          <Grid item xs>
            <Typography variant="caption" className={classes.footer_links}>{title}</Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    theme: state.theme,
  }
}

function Footer(props) {
  const { footer_type, classes, ui_values, theme, ...rest } = props
  const background = Color(theme.palette.default.main)
  let powered_src = "/static/powered.png"
  if (background.isDark()){
    powered_src = "/static/powered_light.png"
  }
  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
        style={{
          marginBottom: 20,
        }}
      >
        <Grid item>
          <a className="github-button" href={ui_values.github} data-size="large" aria-label="View Source Code on GitHub">View Source Code</a><br />
          <a className="github-button" href={ui_values.github_issues} data-size="large" aria-label="Submit Bug Report on GitHub">Submit Bug Report</a>
        </Grid>
        {ui_values.footer_links.map(itemProps=>(
          <Grid item key={itemProps.alt}>
            <FooterLink classes={classes} {...itemProps} />
          </Grid>
        ))}
        <Grid item>
            <FooterLink classes={classes} 
              src={powered_src}
              alt="sigcom" />
          </Grid>
      </Grid>
    </Paper>
  )
}

export default connect(mapStateToProps)(withStyles(styles)(Footer))