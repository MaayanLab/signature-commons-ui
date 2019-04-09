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


import { withStyles } from '@material-ui/core/styles';

import { landingStyle,
         extraComponentStyle } from '../../styles/jss/theme.js'

import SignatureSearch from '../SignatureSearch';
import GenesetSearchBox from "./GenesetSearchBox";

import { fetch_meta } from '../../util/fetch/meta'

import {Charts, CurrentVersion, ListItemLink} from './Misc'
import { Stat } from "../Admin/dashboard.js";
import {get_signature_counts_per_resources} from '../Resources/resources.js'

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))

export default withStyles(landingStyle)(class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: '',
      input: {},
      type: "Overlap",
      libraries_count: 0,
      signatures_count: 0,
      piefields: null,
      pie_controller: null,
      pie_stats: null,
      selected_field: "Assay",
      meta_counts: null,
      general_controller: null,
      counting_fields: null,
      resource_signatures: null,
      per_resource_counts: null,
    }
    this.searchChange = this.searchChange.bind(this)
    this.handleSelectField = this.handleSelectField.bind(this);
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

  async fetch_count(source) {
    const { response } = await fetch_meta({ endpoint: `/${source}/count`, body: {} })
    if(source==="libraries"){
      this.setState({
        libraries_count: response.count
      })
    }else if(source==="signatures"){
      this.setState({
        signatures_count: response.count
      })
    }
  }

  async fetch_stats(selected_field){
    try {
      const pie_controller = new AbortController()
      const db = this.state.piefields[selected_field]
      if( this.state.pie_controller !== null) {
          this.state.pie_controller.abort()
        }
      this.setState({
        pie_controller: pie_controller,
      })

      const url = '/' + db.toLowerCase() +
                  '/value_count?depth=2&filter={"fields":["' +
                  selected_field +'"]}'
      const { response: stats} = await fetch_meta({
        endpoint: url,
        signal: pie_controller.signal
      })

      let stat_vals = undefined
      const object_fields = this.state.counting_fields === null ?
                             ["Cell_Line",
                              "Disease",
                              "Gene",
                              "GO",
                              "Phenotype",
                              "Small_Molecule",
                              "Tissue",
                              "Virus"] :
                              Object.keys(this.state.counting_fields).filter(key=>this.state.counting_fields[key]=="object")
      if(object_fields.includes(selected_field)){
        stat_vals = stats[selected_field + ".Name"]
      }else{
        stat_vals = stats[selected_field]
      }
      this.setState({
        pie_stats: stat_vals,
      })
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          pie_status: ''
        })
      }
    }
  }

  async fetch_metacounts() {
    const fields = (await import("../../ui-schemas/dashboard/counting_fields.json")).default
    this.setState({
      counting_fields: fields
    })
    const object_fields = Object.keys(fields).filter(key=>fields[key]=="object")
    if(this.state.general_controller!==null){
      this.state.general_controller.abort()
    }
    try {
      const general_controller = new AbortController()
      this.setState({
        general_controller: general_controller,
      })
      // UNCOMMENT TO FETCH STUFF IN THE SERVER
      // const { response: meta_stats} = await fetch_meta({
      //   endpoint: '/signatures/value_count',
      //   body: {
      //     depth: 2,
      //     filter: {
      //       fields: Object.keys(fields)
      //     },
      //   },
      //   signal: this.state.general_controller.signal
      // })
      // const meta_counts = Object.keys(meta_stats).filter(key=>key.indexOf(".Name")>-1||
      //                                                         // (key.indexOf(".PubChemID")>-1 &&
      //                                                         //  key.indexOf("Small_Molecule")>-1) ||
      //                                                         (key.indexOf(".")===-1 && object_fields.indexOf(key)===-1))
      //                                                 .reduce((stat_list, k)=>{
      //                                                 stat_list.push({name: k.indexOf('PubChemID')!==-1 ? 
      //                                                                         k.replace("Small_Molecule.", ""):
      //                                                                         k.replace(".Name", ""),
      //                                                                 counts:Object.keys(meta_stats[k]).length})
      //                                                 return(stat_list) },
      //                                                 [])
      const meta_counts = (await import("../../ui-schemas/dashboard/saved_counts.json")).default
      meta_counts.sort((a, b) => a.name > b.name);
      this.setState({
        meta_counts: meta_counts,
      })
     } catch(e) {
         if(e.code !== DOMException.ABORT_ERR) {
           this.setState({
             status: ''
           })
         }
       }
  }

  handleSelectField(e){
    const field = e.target.value
    this.setState({
      selected_field: field,
      pie_stats: null,
    },()=>{
     this.fetch_stats(this.state.selected_field)
    })
  }

  async componentDidMount(){
    if(this.state.libraries_count===0){
      this.fetch_count("libraries")
    }
    if(this.state.signatures_count===0){
      this.fetch_count("signatures")
    }
    if(this.state.piefields===null){
        const response = (await import("../../ui-schemas/dashboard/pie_fields.json")).default
        this.setState({
          piefields: response
        },()=>{
          this.fetch_stats(this.state.selected_field)
        })
    }
    if(this.state.meta_counts===null){
      this.fetch_metacounts()
    }
    const resource_controller = new AbortController()
    this.setState({
      resource_controller: resource_controller,
    })
    // Pre computed
    if(this.state.resource_signatures===null){
      const response = (await import("../../ui-schemas/resources/all.json")).default
      const resource_signatures = response.filter(data=>data.Resource_Name!=="Enrichr").reduce((group, data)=>{
        group[data.Resource_Name] = data.Signature_Count
        return group
      }, {})
     // let for_sorting = Object.keys(resource_signatures).map(resource=>({name: resource,
     //                                                                          counts: resource_signatures[resource]}))

     //  for_sorting.sort(function(a, b) {
     //      return b.counts - a.counts;
     //  }); 
      this.setState({
        resource_signatures: resource_signatures//for_sorting.slice(0,11),
      })
    }
    // Via Server
    if(this.state.per_resource_counts===null){
      this.setState({...(await get_signature_counts_per_resources(this.state.resource_controller))})
    }
  }

  componentWillUnmount(){
    this.state.general_controller.abort()
    this.state.resource_controller.abort()
  }

  

  ResourceExtraComponent = withStyles(extraComponentStyle)(({ classes, ...props }) => {
    if(this.state.resource_signatures===null && this.state.signatures_count==0){
      return(<div/>)
    }else{
      const for_rounding = 10**((""+this.state.signatures_count).length-1)
      const signatures = Math.floor(this.state.signatures_count/for_rounding)*for_rounding
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
                  <CloudUpload />
                </ListItemIcon>
                <ListItemLink href="#/UploadCollection">
                  <ListItemText primary="Upload a new resource/library" />
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
            Explore the database, two ways: (1) searching over the metadata of the signatures using relevant terms, (2) mining for enriched genesets using your own gene list of interest.
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
                    {this.state.libraries_count > 0 && this.state.signatures_count > 0 && this.state.resource_signatures!==null ? 
                        <CurrentVersion libraries_count={this.state.libraries_count}
                                        signatures_count={this.state.signatures_count}
                                        resources_count={Object.keys(this.state.resource_signatures).length}/>: null}
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
                  <Charts piefields={this.state.piefields}
                          pie_stats={this.state.resource_signatures}
                          pie_name={"Resources"}
                          color={"Green"}
                          selected_field={this.state.selected_field}
                          handleSelectField={this.handleSelectField}
                          ExtraComponent={this.ResourceExtraComponent}
                          />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Charts piefields={this.state.piefields}
                          pie_stats={this.state.pie_stats}
                          color={"Purple"}
                          selected_field={this.state.selected_field}
                          ExtraComponent={this.MetaExtraComponent}
                          handleSelectField={this.handleSelectField}/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Stat type="Stats"
                        fields={this.state.counting_fields}
                        signature_counts={this.state.meta_counts}
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