import React from 'react'
import dynamic from 'next/dynamic'
import { Link } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'
import { animateScroll as scroll } from 'react-scroll'
import Color from 'color'
import { makeTemplate } from "../../util/makeTemplate"
import ReactWordcloud from 'react-wordcloud'

import { FindReplace,
  FileFind,
  NearMe,
  Earth } from 'mdi-material-ui'

import SearchBoxWrapper from '../SignatureSearch/SearchBoxWrapper'

const MetadataSearchBox = dynamic(() => import('../../components/MetadataSearch/MetadataSearchBox'))

const meta_default_icon = 'mdi-creation'

export const BottomLinks = ({ classes, width, theme, ...props }) => {
  const fontColor = Color(theme.palette.defaultCard.main)
  return (
    <Grid container
      spacing={24}
      alignItems={'center'}>
      <Grid item xs={12}>
        <div className={classes.centered}>
          <Typography variant="title">
            { props.ui_values.text_4 || 'Start using Signature Commons on your project'}
          </Typography>
        </div>
      </Grid>
      {props.ui_values.nav.MetadataSearch && props.ui_values.nav.MetadataSearch.active ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Link to={`${props.ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}>
                  <Button className={`${classes.bottomLink}`} variant="contained" color='default' onClick={() => scroll.scrollToTop()}>
                    <FileFind className={fontColor.isDark() ? classes.icon_light: classes.icon} />
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                  {props.ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid> : null
      }
      {props.ui_values.nav.SignatureSearch && props.ui_values.nav.SignatureSearch.active ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Link to={`${props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}>
                  <Button className={`${classes.bottomLink}`} variant="contained" color='default' onClick={() => scroll.scrollToTop()}>
                    <FindReplace className={fontColor.isDark() ? classes.icon_light: classes.icon} />
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                  {props.ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid> : null
      }
      {props.ui_values.nav.Resources && props.ui_values.nav.Resources.active ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Button className={`${classes.bottomLink}`} variant="contained" color='default' href={`#/${props.ui_values.preferred_name.resources || 'Resources'}`}>
                  <NearMe className={fontColor.isDark() ? classes.icon_light: classes.icon} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                  {`Browse ${props.ui_values.nav.Resources.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}`}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid> : null
      }
      <Grid item xs>
        <div className={classes.centered}>
          <Grid container
            spacing={8}
            alignItems={'center'}
            direction={'column'}>
            <Grid item xs={12}>
              <Link to="/API">
                <Button className={`${classes.bottomLink}`} variant="contained" color='default'>
                  <Earth className={fontColor.isDark() ? classes.icon_light: classes.icon} />
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subheading">
                  API
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  )
}

export const CountsDiv = ({ classes, width, ...props }) => {
  const { meta_counts } = props
  let sm = 3
  let xs = 4
  const md = 2
  if (meta_counts.length < 4) {
    sm = 12 / meta_counts.length
    xs = 12 / meta_counts.length
  }
  return (
    <Grid container
      spacing={24}
      alignItems={'center'}
      justify={'center'}>
      <Grid item xs={12}>
        <div className={classes.centered}>
          <Typography variant="title">
            {props.ui_values.text_2 || 'Search across a broad gathering of perturbations'}
          </Typography>
        </div>
      </Grid>
      {meta_counts.map((entry) => (
        <Grid item xs={xs} sm={sm} md={md} key={entry.name}>
          <div className={classes.centered}>
            { entry.icon === undefined ? <span className={`mdi ${meta_default_icon} mdi-36px`}></span> :
              <span className={`mdi ${entry.icon} mdi-36px`}></span>
            }
            <Typography variant="subheading">
              {entry.counts}
            </Typography>
            <Typography variant="caption">
              {entry.Preferred_Name}
            </Typography>
          </div>
        </Grid>
      ))}
    </Grid>
  )
}

export const StatDiv = ({ classes, width, ...props }) => {
  const visible_stats = props.table_counts.filter((item) => item.Visible_On_Landing)
  const xs = visible_stats.length <= 4 ? 12 / visible_stats.length : 3
  return (
    <Grid container
      spacing={24}
      alignItems={'center'}>
      <Grid item xs={12}>
        <Grid container
          spacing={24}
          alignItems={'center'}>
          <Grid item xs={12}>
            <div className={classes.centered}>
              <Typography variant="title">
                {props.ui_values.text_1 || 'Explore an extensive collection of well-annotated gene-sets and signatures'}
              </Typography>
            </div>
          </Grid>
          {visible_stats.map((item) => (
            <Grid item xs={xs} key={item.preferred_name}>
              <div className={classes.centered}>
                <span className={`mdi ${item.icon} mdi-36px`}></span>
                <Typography variant="title" component="h5">
                  {item.counts}
                </Typography>
                {item.preferred_name}
              </div>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export const SearchCard = ({ classes, width, ...props }) => {
  const { SignatureSearch, MetadataSearch } = props.ui_values.nav
  if (SignatureSearch && SignatureSearch.active && MetadataSearch && MetadataSearch.active) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <CardContent>
          <Grid container
            spacing={24}
            direction={'column'}
            align="center"
            justify="center">
            <Grid item xs={12}>
              <Typography variant="h4" align={'center'} color="inherit">
              {props.ui_values.header_info.header_left}<img {...props.ui_values.header_info.icon} src={makeTemplate(props.ui_values.header_info.icon.src, {})} />{props.ui_values.header_info.header_right}
              </Typography>
              <Typography variant="h5" align={'center'} color="inherit">
                {props.location.pathname.split("/")[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              { MetadataSearch && props.match.params.searchType == MetadataSearch.endpoint.substring(1) ?
                <MetadataSearchBox
                  id='MetadataSearch'
                  {...props}
                /> :
                <SearchBoxWrapper
                  {...props}
                />
              }
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  } else if (SignatureSearch && SignatureSearch.active) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <CardContent>
          <Grid container
            spacing={24}
            direction={'column'}
            align="center"
            justify="center">
            <Grid item xs={12}>
              <Typography variant="h4" color={"inherit"} align={'center'}>
              {props.ui_values.header_info.header_left}<img {...props.ui_values.header_info.icon} src={makeTemplate(props.ui_values.header_info.icon.src, {})} />{props.ui_values.header_info.header_right}
              </Typography>
              <Typography variant="h5" align={'center'} color="inherit">
                {props.location.pathname.split("/")[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <SearchBoxWrapper
                {...props}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  } else if (MetadataSearch && MetadataSearch.active) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <CardContent>
          <Grid container
            spacing={24}
            direction={'column'}
            align="center"
            justify="center">
            <Grid item xs={12}>
              <Typography variant="h4" align={'center'} color="inherit">
                {props.ui_values.header_info.header_left}<img {...props.ui_values.header_info.icon} src={makeTemplate(props.ui_values.header_info.icon.src, {})} />{props.ui_values.header_info.header_right}
              </Typography>
              <Typography variant="h5" align={'center'} color="inherit">
                {props.location.pathname.split("/")[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <MetadataSearchBox
                id='MetadataSearch'
                {...props}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  } else {
    return null
  }
}

export const ListItemLink = (props) => (
  <ListItem button component="a" {...props} />
)

function getCallback(callback, searchTable) {
  return function(word) {
    location.href = `#/MetadataSearch/${searchTable}?q={"search":["${word.text}"]}`
  }
}


export const WordCloud = function({ classes, searchTable, record = {}, ...props }) {
  const { stats } = props
  if (stats !== null && stats!==undefined) {
    const wordstats = stats.map(function(entry) {
      return ({ 'text': entry.name, 'value': entry.counts })
    })
    wordstats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

    return (
      <div style={{ width: "100%", height: 420, display: 'block', margin: 'auto' }}>
        <ReactWordcloud words={wordstats}
          callbacks={{
            onWordClick: getCallback('onWordClick', searchTable)
          }}
          scale={'log'}
          options={{
            colors: ['#000'],
            scale: 'log',
            rotations: 3,
            rotationsAngles: [0, 90],
          }} />
      </div>
    )
  } else {
    return null
  }
}
