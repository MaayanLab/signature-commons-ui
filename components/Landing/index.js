import React from "react";
import { Redirect, Link } from 'react-router-dom';
import dynamic from 'next/dynamic';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import NearMe from '@material-ui/icons/NearMe';
import CloudUpload from '@material-ui/icons/CloudUpload';
import Pageview from '@material-ui/icons/Pageview';
import FindReplace from '@material-ui/icons/FindReplace';
import Public from '@material-ui/icons/Public';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { landingStyle,
         extraComponentStyle } from '../../styles/jss/theme.js'

import SignatureSearch from '../SignatureSearch';
import GenesetSearchBox from "./GenesetSearchBox";

import { fetch_meta } from '../../util/fetch/meta'

import { CurrentVersion, ListItemLink} from './Misc'
import { Charts, Stat } from "../Admin/dashboard.js";
import { base_scheme as meta_base_scheme, base_url as meta_base_url } from "../../util/fetch/meta";

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))

export default withStyles(landingStyle)(class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: '',
      input: {},
      type: "Overlap",
    }
    this.searchChange = this.searchChange.bind(this)
  }

  geneset_searchbox = (props) => (
    <GenesetSearchBox
      onSubmit={this.submit}
      type={this.state.type}
      {...props}
    />
  )

  searchChange(e) {
    this.setState({ search: e.target.value })
  }

  ResourceExtraComponent = withStyles(extraComponentStyle)(({ classes, ...props }) => {
    if(this.props.resource_signatures===null && this.props.signatures_count==0){
      return(<div/>)
    }else{
      const for_rounding = 10**((""+this.props.signatures_count).length-1)
      const signatures = Math.floor(this.props.signatures_count/for_rounding)*for_rounding
      return(
        <Grid container 
              spacing={24}
              direction={"column"}
              align={"left"}>
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
    return(
      <Grid container 
            spacing={24}
            direction={"column"}
            align={"left"}>
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

  render(){
    const {classes} = this.props
    return(
      <div>
        <Grid container 
              spacing={24}
              alignItems={"center"}
              direction={"column"}>
          <Grid item xs={12}>
            <Card className={classes.topCard}>
              <Grid container 
                spacing={24}
                align="center"
                justify="center">
                <Grid item xs={12} md={7}>
                  <Grid container 
                    spacing={24}
                    direction={"column"}
                    align="center"
                    justify="center">
                    <Grid item xs={12}>
                      <Typography variant="headline" className={classes.title} component="h3">
                          SIGNATURE COMMONS
                      </Typography>
                      <Typography className={classes.subtitle} color="textSecondary">
                          Search over half a million signatures collated from an ever-growing number of resources.
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <SearchBox
                        search={this.state.search}
                        searchChange={this.searchChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                    {this.props.libraries_count > 0 && this.props.signatures_count > 0 && this.props.resource_signatures!==null ? 
                        <CurrentVersion libraries_count={this.props.libraries_count}
                                        signatures_count={this.props.signatures_count}
                                        resources_count={Object.keys(this.props.resource_signatures).length}/>: null}
                    </Grid>
                    <Grid item xs={12}>
                      {/* <Link
                        to={{ pathname: '/UploadCollection' }}
                      > */}
                        <Button variant="contained" color="secondary" className={classes.button} disabled>
                          Upload your signatures
                          <CloudUpload className={classes.rightIcon}/>
                        </Button>
                      {/* </Link> */}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Grid item xs={12}>
                    {this.geneset_searchbox(this.props)}
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Grid container 
                spacing={24}
                align="center"
                justify="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Charts piefields={this.props.piefields}
                          pie_stats={this.props.resource_signatures}
                          pie_name={"Resources"}
                          color={"Green"}
                          selected_field={this.props.selected_field}
                          handleSelectField={this.props.handleSelectField}
                          ExtraComponent={this.ResourceExtraComponent}
                          longcard
                          />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Charts piefields={this.props.piefields}
                          pie_stats={this.props.pie_stats}
                          color={"Purple"}
                          selected_field={this.props.selected_field}
                          ExtraComponent={this.MetaExtraComponent}
                          handleSelectField={this.props.handleSelectField}
                          longcard/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Stat type="Stats"
                        fields={this.props.counting_fields}
                        signature_counts={this.props.meta_counts}
                        color={"Orange"}
                        name={"Stats"}
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