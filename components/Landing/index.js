import React from 'react'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import NearMe from '@material-ui/icons/NearMe'
import Pageview from '@material-ui/icons/Pageview'
import FindReplace from '@material-ui/icons/FindReplace'
import Public from '@material-ui/icons/Public'
import { withStyles } from '@material-ui/core/styles'

import { landingStyle,
  extraComponentStyle } from '../../styles/jss/theme.js'


import { ListItemLink, TitleCard } from './Misc'
import { Charts, Stat } from '../Admin/dashboard.js'
import { base_scheme as meta_base_scheme, base_url as meta_base_url } from '../../util/fetch/meta'

export default withStyles(landingStyle)(class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      input: {},
      type: 'Overlap',
    }
    this.searchChange = this.searchChange.bind(this)
  }

  searchChange(e) {
    this.setState({ search: e.target.value })
  }

  ResourceExtraComponent = withStyles(extraComponentStyle)(({ classes, ...props }) => {
    if (this.props.resource_signatures===null && this.props.signatures_count==0) {
      return (<div/>)
    } else {
      return (
        <Grid container
          spacing={24}
          direction={'column'}
          align={'left'}>
          <Grid item xs={12}>
            <Typography variant="headline" className={classes.paragraph} component="p">
              Signature commons provides a one stop repository for signature data collected from a wide-array of resources. Information is available in both human and machine readable formats.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <List dense>
              <ListItem button className={classes.listItem}>
                <ListItemIcon>
                  <NearMe />
                </ListItemIcon>
                <ListItemLink href="#/Resources">
                  <ListItemText primary="Explore our resource list" />
                </ListItemLink>
              </ListItem>
              <ListItem button className={classes.listItem}>
                <ListItemIcon>
                  <Public />
                </ListItemIcon>
                <ListItemLink href={`${meta_base_scheme}://petstore.swagger.io/?url=${meta_base_url}/openapi.json`}>
                  <ListItemText primary="Browse API" />
                </ListItemLink>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      )
    }
  })

  MetaExtraComponent = withStyles(extraComponentStyle)(({ classes, ...props }) => {
    return (
      <Grid container
        spacing={24}
        direction={'column'}
        align={'left'}>
        <Grid item xs={12}>
          <Typography variant="headline" className={classes.paragraph} component="p">
            Explore the database, two ways: (1) search over the metadata of the signatures using relevant terms, (2) mine for enriched genesets using your own gene list of interest.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <List dense>
            <ListItem button className={classes.listItem}>
              <ListItemIcon>
                <Pageview />
              </ListItemIcon>
              <ListItemLink href="#/MetadataSearch">
                <ListItemText primary="Metadata Search" />
              </ListItemLink>
            </ListItem>
            <ListItem button className={classes.listItem}>
              <ListItemIcon>
                <FindReplace />
              </ListItemIcon>
              <ListItemLink href="#/SignatureSearch">
                <ListItemText primary="Geneset search" />
              </ListItemLink>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    )
  })


  render() {
    return (
      <div>
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item xs={12}>
            <TitleCard search={this.state.search}
              searchChange={this.searchChange}
              type={this.state.type}
              submit={this.submit}
              {...this.props} />
          </Grid>
          <Grid item xs={12}>
            <Grid container
              spacing={24}
              align="center"
              justify="center">
              <Grid item xs={12} sm={6} md={4}>
                <Charts piefields={this.props.piefields}
                  pie_stats={this.props.resource_signatures}
                  pie_name={'Resources'}
                  color={'Green'}
                  selected_field={this.props.selected_field}
                  handleSelectField={this.props.handleSelectField}
                  ExtraComponent={this.ResourceExtraComponent}
                  longcard
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Charts piefields={this.props.piefields}
                  pie_stats={this.props.pie_stats}
                  color={'Purple'}
                  selected_field={this.props.selected_field}
                  ExtraComponent={this.MetaExtraComponent}
                  handleSelectField={this.props.handleSelectField}
                  longcard/>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Stat type="Stats"
                  fields={this.props.counting_fields}
                  signature_counts={this.props.meta_counts}
                  preferred_name={this.props.preferred_name}
                  color={'Orange'}
                  name={'Stats'}
                  dense/>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
          </Grid>
        </Grid>
      </div>
    )
  }
})
