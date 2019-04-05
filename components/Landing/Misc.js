import React from "react";

import {scaleDiscontinuous} from 'd3fc';

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

import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'
import { styles } from '../../styles/jss/theme.js'

import { DonutChart } from "../Admin/VXpie.js";
import { CardIcon, PieChart, Selections } from "../Admin/dashboard.js";


const textstyles = {
  currentVesion: {
    color: "#FFF",
    fontWeight: 'bold',
  },
  highlighted: {
    color: "#FFD042"
  }
}

export const CurrentVersion = withStyles(textstyles)(({classes, ...props}) => (
    <div className={classes.currentVesion}>
      Current Database: 
      <span className={classes.highlighted}>{props.libraries_count.toLocaleString() }</span> Libraries | &nbsp;
      <span className={classes.highlighted}>{props.signatures_count.toLocaleString()}</span> signatures</div>
))


const ChartCard = withStyles(cardChartStyle)( function({ classes, ...props }){
  const {piefields,
         pie_stats,
         selected_field} = props
  return(
    <Card className={classes.cardChart}>
      <Grid container 
        spacing={0}
        direction={"column"}
        align="center"
        justify="center">
        <Grid item xs={12}>
          {pie_stats===null ?
            <div className={classes.progress}>
              <CircularProgress />
            </div>:
            <PieChart stats={pie_stats} {...props}/>
          }
        </Grid>
      </Grid>
    </Card>
  )
})

export const Charts = withStyles(styles)( function({ classes, ...props }){
  
  const {piefields,
         pie_stats,
         pie_name,
         selected_field,
         ExtraComponent} = props
  
  return(
    <div className={classes.main}>
      <CardIcon Icon={DonutSmall} type={`${props.color}CardHeader`} />
      <Card className={`${classes.card}`}>
        {pie_name === undefined ? 
          <div>
            {piefields===null ?
              <div className={classes.ProgressContainer}>
                <LinearProgress/>
              </div>:
              <Selections
                value={selected_field === null ? piefields[0]: selected_field}
                values={Object.keys(piefields).sort()}
                onChange={e => props.handleSelectField(e)}
              />
            }
          </div> : <Typography className={classes.namebox} color="textPrimary" component="h3">{pie_name}</Typography>
        }
        <ChartCard selected_db="Entities" {...props}/>
        {ExtraComponent===undefined ? null: <ExtraComponent {...props}/>}
      </Card>
    </div>
  )
})

export const ListItemLink = (props) => (
    <ListItem button component="a" {...props} />
  )