import React from 'react'
import dynamic from 'next/dynamic'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'

import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { base_scheme as meta_base_scheme, base_url as meta_base_url } from '../../util/fetch/meta'

import ReactWordcloud from 'react-wordcloud'

import { FindReplace,
  FileFind,
  NearMe,
  Earth } from 'mdi-material-ui'

import GenesetSearchBox from './GenesetSearchBox'

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))

const meta_default_icon = 'mdi-creation'

export const BottomLinks = ({ classes, width, ...props }) => {
  return (
    <Grid container
      spacing={24}
      alignItems={'center'}>
      <Grid item xs={12}>
        <div className={classes.centered}>
          <Typography variant="title">
            { props.ui_values.LandingText.text_4 || 'Start using Signature Commons on your project'}
          </Typography>
        </div>
      </Grid>
      {props.ui_values.nav.metadata_search ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Button className={`${classes.cardIcon} ${classes.GrayCardHeader}`}
                  onClick={(e) => props.handleChange(e, 'metadata', true)}>
                  <FileFind className={classes.icon} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                    Metadata Search
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid> : null
      }
      {props.ui_values.nav.signature_search ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Button className={`${classes.cardIcon} ${classes.GrayCardHeader}`}
                  onClick={(e) => props.handleChange(e, 'signature', true)}>
                  <FindReplace className={classes.icon} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                    Signature Search
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Grid> : null
      }
      {props.ui_values.nav.resources ?
        <Grid item xs>
          <div className={classes.centered}>
            <Grid container
              spacing={8}
              alignItems={'center'}
              direction={'column'}>
              <Grid item xs={12}>
                <Button className={`${classes.cardIcon} ${classes.GrayCardHeader}`} href={`#/${props.ui_values.preferred_name.resources || 'Resources'}`}>
                  <NearMe className={classes.icon} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subheading">
                  {`Browse ${props.ui_values.preferred_name.resources || 'Resources'}`}
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
              <Button className={`${classes.cardIcon} ${classes.GrayCardHeader}`}
                href={`${meta_base_scheme}://petstore.swagger.io/?url=${meta_base_url}/openapi.json`}>
                <Earth className={classes.icon} />
              </Button>
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
            {props.ui_values.LandingText.text_2 || 'Search across a broad gathering of perturbations'}
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
                {props.ui_values.LandingText.text_1 || 'Explore an extensive collection of well-annotated gene-sets and signatures'}
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
  const { signature_search, metadata_search } = props.ui_values.nav
  if (signature_search && metadata_search) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <Grid container
          spacing={24}
          direction={'column'}
          align="center"
          justify="center">
          <Grid item xs={12}>
            <div className={classes.toggleContainer}>
              <ToggleButtonGroup value={props.searchType} exclusive onChange={props.handleChange}>
                <ToggleButton value="metadata">
                  <FileFind />
                  Metadata Search
                </ToggleButton>
                <ToggleButton value="signature">
                  <FindReplace />
                  Signature Search
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Grid>
          <Grid item xs={12}>
            {props.searchType == 'metadata' ?
              <SearchBox
                id='metadata'
                search={props.search}
                searchChange={props.searchChange}
                currentSearchChange={props.currentSearchChange}
                ui_values={props.ui_values}
              /> :
              <GenesetSearchBox
                id="signature"
                onSubmit={props.submit}
                type={props.type}
                {...props}
              />
            }
          </Grid>
        </Grid>
      </Card>
    )
  } else if (signature_search) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <Grid container
          spacing={24}
          direction={'column'}
          align="center"
          justify="center">
          <Grid item xs={12}>
            <GenesetSearchBox
              id="signature"
              onSubmit={props.submit}
              type={props.type}
              {...props}
            />
          </Grid>
        </Grid>
      </Card>
    )
  } else if (metadata_search) {
    return (
      <Card className={`${classes.paddedCard} ${classes.topCard}`}>
        <Grid container
          spacing={24}
          direction={'column'}
          align="center"
          justify="center">
          <Grid item xs={12}>
            <SearchBox
              id='metadata'
              search={props.search}
              searchChange={props.searchChange}
              currentSearchChange={props.currentSearchChange}
              ui_values={props.ui_values}
            />
          </Grid>
        </Grid>
      </Card>
    )
  } else {
    return (null)
  }
}

export const ListItemLink = (props) => (
  <ListItem button component="a" {...props} />
)

function getCallback(callback) {
  return function(word) {
    location.href = `#/MetadataSearch?q=${word.text}`
  }
}

const callbacks = {
  onWordClick: getCallback('onWordClick'),
}

export const WordCloud = function({ classes, record = {}, ...props }) {
  const { stats } = props
  if (stats !== null) {
    const wordstats = Object.entries(stats).map(function(entry) {
      return ({ 'text': entry[0], 'value': entry[1] })
    })
    wordstats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

    return (
      <div style={{ width: 300, height: 300, display: 'block', margin: 'auto' }}>
        <ReactWordcloud words={wordstats}
          callbacks={callbacks}
          options={{
            colors: ['#000'],
            rotations: 3,
            rotationsAngles: [0, 90],
          }} />
      </div>
    )
  } else {
    return (<div />)
  }
}
