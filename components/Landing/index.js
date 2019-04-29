import React from "react";
import { Redirect } from 'react-router-dom';
import dynamic from 'next/dynamic';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';

import { landingStyle } from '../../styles/jss/theme.js'

import SignatureSearch from '../SignatureSearch';
import GenesetSearchBox from "./GenesetSearchBox";

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))

export default withStyles(landingStyle)(class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: '',
      input: {},
      type: "Overlap"
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

  LandingCard(props){
    const LandingTopCard = withStyles(landingStyle)(({classes, props }) => (
        <Card className={classes.topCard}>
          <Grid container 
            spacing={0}
            align="center"
            justify="center">
            <Grid item md={7} xs={12}>
              <Grid container 
                spacing={0}
                direction={"column"}
                align="center"
                justify="center">
                <Grid item xs={12}>
                  <Typography variant="headline" className={classes.title} component="h5">
                      SIGNATURE COMMONS PROJECT
                  </Typography>
                  <Typography className={classes.title} color="textSecondary">
                      Search over half a million signatures
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <SearchBox
                    search={this.state.search}
                    searchChange={this.searchChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={5} xs={12}>
              {this.geneset_searchbox(props)}
            </Grid>
          </Grid>
        </Card>
    ));
    return(<LandingTopCard />)
  }

  render(){
    const {classes} = this.props
    return(
      <div>
        <Card className={classes.topCard}>
          <Grid container 
            spacing={0}
            align="center"
            justify="center">
            <Grid item xs={7}>
              <Grid container 
                spacing={0}
                direction={"column"}
                align="center"
                justify="center">
                <Grid item xs={12}>
                  <Typography variant="headline" className={classes.title} component="h5">
                      SIGNATURE COMMONS PROJECT
                  </Typography>
                  <Typography className={classes.title} color="textSecondary">
                      Search over half a million signatures
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <SearchBox
                    search={this.state.search}
                    searchChange={this.searchChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              {this.geneset_searchbox(this.props)}
            </Grid>
          </Grid>
        </Card>
      </div>
    )
  }
})