import React from "react";
import dynamic from 'next/dynamic';
import { Redirect, Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import DonutSmall from '@material-ui/icons/DonutSmall';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withScreenSize } from '@vx/responsive';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import withWidth from '@material-ui/core/withWidth';
import Button from '@material-ui/core/Button';
import CloudUpload from '@material-ui/icons/CloudUpload';

import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'
import { styles } from '../../styles/jss/theme.js'

import { DonutChart } from "../Admin/VXpie.js";
import { CardIcon, PieChart, Selections } from "../Admin/dashboard.js";
import GenesetSearchBox from "./GenesetSearchBox";

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))


const textstyles = {
  currentVesion: {
    color: "#FFF",
    fontWeight: 'bold',
  },
  highlighted: {
    color: "#FFD042"
  }
}

export const CurrentVersion = withStyles(textstyles)(({classes, ...props}) => {
  const date = new Date()
  return(
    <div className={classes.currentVesion}>
      Current Version: <span className={classes.highlighted}>{date.toDateString()}</span>
      <ul>
        <li>
          <span className={classes.highlighted}>{props.signatures_count.toLocaleString()}</span> Signatures
        </li>
        <li>
          <span className={classes.highlighted}>{props.libraries_count.toLocaleString() }</span> Libraries
        </li>
        <li>
          <span className={classes.highlighted}>{props.resources_count.toLocaleString() }</span> Resources
        </li>
      </ul>
    </div>
  )
})

export const TitleCard = withWidth()(({classes, width, ...props }) =>{
    if(width==="sm" || width==="xs"){
      return(
        <Card className={classes.topCard}>
          <Grid container 
            spacing={24}
            align="center"
            justify="center">
            <Grid item xs={12}>
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
                {props.LibraryNumber > 0 && props.SignatureNumber > 0 && props.resource_signatures!==null ? 
                    <CurrentVersion libraries_count={props.LibraryNumber}
                                    signatures_count={props.SignatureNumber}
                                    resources_count={Object.keys(props.resource_signatures).length}/>: null}
                </Grid>
                <Grid item xs={12}>
                  <SearchBox
                    search={props.search}
                    searchChange={props.searchChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <GenesetSearchBox
                  onSubmit={props.submit}
                  type={props.type}
                  {...props}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container 
                spacing={24}
                align="center"
                justify="center">
                <Grid item xs={12}>
                  <Link
                    to={{ pathname: '/UploadCollection' }}
                  >
                    <Button variant="contained" color="secondary" className={classes.button}>
                      Upload your signatures
                      <CloudUpload className={classes.rightIcon}/>
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
            </Grid>
          </Grid>
        </Card>
      )
    }else{
      return(
        <Card className={classes.topCard}>
          <Grid container 
            spacing={24}
            align="center"
            justify="center">
            <Grid item md={7}>
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
                    search={props.search}
                    searchChange={props.searchChange}
                  />
                </Grid>
                <Grid item xs={12}>
                {props.LibraryNumber > 0 && props.SignatureNumber > 0 && props.resource_signatures!==null ? 
                    <CurrentVersion libraries_count={props.LibraryNumber}
                                    signatures_count={props.SignatureNumber}
                                    resources_count={Object.keys(props.resource_signatures).length}/>: null}
                </Grid>
                <Grid item xs={12}>
                  <Link
                    to={{ pathname: '/UploadCollection' }}
                  >
                    <Button variant="contained" color="secondary" className={classes.button}>
                      Upload your signatures
                      <CloudUpload className={classes.rightIcon}/>
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={5}>
              <Grid item xs={12}>
                <GenesetSearchBox
                  onSubmit={props.submit}
                  type={props.type}
                  {...props}
                />
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )
    }
  })


export const ListItemLink = (props) => (
    <ListItem button component="a" {...props} />
  )