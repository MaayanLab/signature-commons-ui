import React from "react";

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import DonutSmall from '@material-ui/icons/DonutSmall';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withScreenSize } from '@vx/responsive';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

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


const ChartCard = withStyles(cardChartStyle)( function({ classes, record={}, ...props }){
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
          {selected_field.replace(/_/g, " ")}
        </Grid>
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

export const Charts = withStyles(styles)( function({ classes, record={}, ...props }){
  
  const {piefields,
         pie_stats,
         selected_field} = props
  
  return(
    <div className={classes.main}>
      <CardIcon Icon={DonutSmall} type={'EntitiesCardHeader'} />
      <Card className={`${classes.card}`}>
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
        <ChartCard selected_db="Entities" {...props}/>
      </Card>
    </div>
  )
})
