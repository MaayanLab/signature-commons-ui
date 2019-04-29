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


export const ListItemLink = (props) => (
    <ListItem button component="a" {...props} />
  )