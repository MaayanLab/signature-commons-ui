import React from 'react'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { withStyles } from '@material-ui/core/styles'
import Color from 'color'

import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Paper = dynamic(()=>import('@material-ui/core/Paper'));
const Button = dynamic(()=>import('@material-ui/core/Button'));

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    background: theme.palette.default.main,
  },
  footer_links: {
    color: theme.palette.default.contrastText,
  },
})

const FooterLink = ({ src, alt, href, title, classes, containerProps, imageProps }) => {
  if (href) {
    return (
      <Button href={href} style={{ width: 150 }} {...containerProps}>
        <Grid container align={'center'}>
          <Grid item xs>
            <img src={makeTemplate(src, {})} alt={alt || title} style={{ width: 150 }} {...imageProps}/>
          </Grid>
          <Grid item xs>
            <Typography variant="caption" className={classes.footer_links}>{title}</Typography>
          </Grid>
        </Grid>
      </Button>
    )
  } else {
    return (
      <Paper href={href} elevation={0} style={{ width: 150, background: 'inherit' }} {...containerProps}>
        <Grid container align={'center'}>
          <Grid item xs>
            <img src={makeTemplate(src, {})} alt={alt || title} style={{ width: 150 }} {...imageProps}/>
          </Grid>
          <Grid item xs>
            <Typography variant="caption" className={classes.footer_links}>{title}</Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}


function Footer(props) {
  const { classes, ui_values, theme, ...rest } = props
  const background = Color(theme.palette.default.main)
  let powered_src = './static/powered.png'
  if (background.isDark()) {
    powered_src = './static/powered_light.png'
  }
  return (
    <Paper className={classes.root} elevation={0} square >
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
          <Grid
            container
            direction="column"
          >
            <Grid item>
            <Button href="#/Terms"
                size="small"
                style={{textTransform: "none"}}
                startIcon={<span className={`mdi mdi-book-open ${background.isDark()? 'mdi-light': 'mdi-dark'}`}/>}
              >
                <Typography style={{color: background.isDark() ? "#FFF":"#000"}}>Terms of Service</Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button href={ui_values.github}
                size="small"
                style={{color: background.isDark() ? "#FFF":"#000"}}
                style={{textTransform: "none"}}
                startIcon={<span className={`mdi mdi-github ${background.isDark()? 'mdi-light': 'mdi-dark'}`}/>}
              >
                <Typography style={{color: background.isDark() ? "#FFF":"#000"}}>View Source Code</Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button href={ui_values.github_issues}
                size="small"
                style={{textTransform: "none"}}
                startIcon={<span className={`mdi mdi-alert-circle-outline ${background.isDark()? 'mdi-light': 'mdi-dark'}`}/>}
              >
                <Typography style={{color: background.isDark() ? "#FFF":"#000"}}>Submit Bugs and Corrections</Typography>
              </Button>
            </Grid>
          </Grid>
          
        </Grid>
        {ui_values.footer_links.map((itemProps) => (
          <Grid item key={itemProps.alt}>
            <FooterLink classes={classes} {...itemProps} />
          </Grid>
        ))}
        {ui_values.powered ?
          <Grid item>
            <FooterLink classes={classes}
              src={powered_src}
              alt="sigcom" />
          </Grid> : null
        }
      </Grid>
    </Paper>
  )
}

export default withStyles(styles)(Footer)