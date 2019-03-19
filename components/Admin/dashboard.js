import React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { withStyles } from '@material-ui/core/styles';
import BlurOn from '@material-ui/icons/BlurOn';
import Fingerprint from '@material-ui/icons/Fingerprint';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Whatshot from '@material-ui/icons/Whatshot';
import DonutSmall from '@material-ui/icons/DonutSmall';
import Assessment from '@material-ui/icons/Assessment';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DonutChart } from "./VXpie.js";
import { withScreenSize } from '@vx/responsive';
// import DonutChart from "./Donut.js";

import { cardIconStyle } from '../../styles/jss/components/CardIconStyle.js'
import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'


const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    progress: {
      margin: theme.spacing.unit * 2,
    },
    ProgressContainer:{
      marginLeft: 'auto',
      marginRight: 0,
      height: 30,
      width: 120
    },
    main: {
      flex: '1',
      marginRight: '1em',
      marginTop: 20,
    },
    numcard: {
      overflow: 'inherit',
      textAlign: 'right',
      padding: 16,
      height: 70,
    },
    card: {
      overflow: 'inherit',
      textAlign: 'right',
      padding: 16,
      minHeight: 80,
    },
    piecard: {
      float: 'center',
      margin: '5px',
      padding: '20px 5px 5px 5px',
      zIndex: 100,
      borderRadius: 3,
    },
    title: {
      fontSize: '10px',
    },
    bigtext:{
      fontSize: '15px',
    },
    statnum: {
      fontSize: '15px',
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 120,
      margin: '-20px 8px 8px 8px',
    },
    menu: {
      width: 200,
    }
});

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
}

const CardIcon = withStyles(cardIconStyle)(({ Icon, classes, type }) => (
    <Card className={`${classes.cardIcon} ${classes[type]}`}>
        <Icon className={classes.icon} />
    </Card>
));

const db_vals = (db, props) => {
  const vals = {
    Libraries: {
      fields: props.library_fields,
      stats: props.libchart,
      selected_field: props.libselected,
      icon : LibraryBooks,
      num : props.LibraryNumber
    },
    Signatures: {
      fields: props.signature_allfields,
      stats: props.sigchart,
      selected_field: props.sigselected,
      icon : Fingerprint,
      num : props.SignatureNumber
    },
    Entities: {
      fields: props.entity_fields,
      stats: props.entchart,
      selected_field: props.entselected,
      icon: BlurOn,
      num: props.EntityNumber
    }
  }
  return(vals[db])
}

const Stat = withStyles(styles)( function({ classes, record={}, ...props }){
    if(props.type!=="Stats"){
      const {icon, num} = db_vals(props.type, props)
      console.log(`${props.type}CardHeader`)
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.type}CardHeader`} />
          <Card className={classes.numcard}>
              <Typography className={classes.title} color="textSecondary">
                  {props.type}
              </Typography>
              <Typography variant="headline" className={classes.statnum} component="h5">
                  {num}
              </Typography>
          </Card>
        </div>
      )
    }else{
      const icon = Assessment
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.type}CardHeader`} />
          <Card className={classes.card}>
              <Typography variant="headline" className={classes.bigtext} component="h5">
                  Stats
              </Typography>
              <Divider />
              {props.signature_counts===null ?
                <List>
                  {["Cell_Line", "Disease", "Gene", "Small_Molecule", "Tissue"].map(item =>(
                    <ListItem>
                      <ListItemText
                        primary={item.replace("_"," ")}
                        secondary={"Loading..."}
                        style={{ paddingRight: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>:
                <List>
                  {props.signature_counts.map(item =>(
                    <ListItem>
                      <ListItemText
                        primary={item.name.replace("_"," ")}
                        secondary={item.counts}
                        style={{ paddingRight: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
            }
          </Card>
        </div>
      )
    }
  })

const PopularGenes = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <div className={classes.main}>
      <CardIcon Icon={Whatshot} type={"PopularCardHeader"} />
      <Card className={classes.card}>
          <Typography variant="headline" className={classes.bigtext} component="h5">
              Hot Genes
          </Typography>
          <Divider />
            <List>
              <ListItem>
                <ListItemText
                  primary={"Coming Soon"}
                  secondary={"12345"}
                  style={{ paddingRight: 0 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Coming Soon"}
                  secondary={"12345"}
                  style={{ paddingRight: 0 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Coming Soon"}
                  secondary={"12345"}
                  style={{ paddingRight: 0 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Coming Soon"}
                  secondary={"12345"}
                  style={{ paddingRight: 0 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Coming Soon"}
                  secondary={"12345"}
                  style={{ paddingRight: 0 }}
                />
              </ListItem>
            </List>
      </Card>
    </div>
  )
})

const Selections = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <TextField
      id="charts"
      select
      label={props.name}
      className={classes.textField}
      value={props.value}
      SelectProps={{
        MenuProps: {
          className: classes.menu,
        },
      }}
      margin="normal"
      variant="outlined"
      onChange={props.onChange}
    >
      {props.values.map(function(k){
        if(!["$validator", "Original_String"].includes(k)){
          return(
            <MenuItem key={k} value={k}>
              {k.replace(/_/g," ")}
            </MenuItem>
          )
        }
      })}
    </TextField>
  )
})

const PieChart = withScreenSize(withStyles(styles)( function({ classes, record={}, ...props }){
  var stats = Object.entries(props.stats).map(function(entry){
      return({"label": entry[0], "value": entry[1]});
    });
    stats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    var included = stats.slice(0,14)
    const included_sum = included.sum("value")
    const other = stats.slice(14,).sum("value")
    const other_sum = included_sum > other || included_sum < included.length*10 ? other: included_sum*1.5
    var others = [{"label": "others", "value":other_sum}]
    var data = other_sum >0 ? included.concat(others): included;
    var percentages = included.map((entry)=>(
                        {label:entry.label, value: (100*(entry.value/(included_sum+other))).toFixed(2)}
                      ))
    percentages = percentages.concat({label:"others",value:(100*(other/(included_sum+other))).toFixed(2)})

    data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    percentages.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    let width = 220
    const height = 220
    const radius= 150
    if(props.screenWidth<1086 && props.screenWidth>960){
      width = 180
    }
    return(
      <div><DonutChart width={width}
                       height={height}
                       radius={radius}
                       margin={{
                          "top":10,
                          "bottom":10,
                          "left":10,
                          "right":10}}
                       data={data}
                       percentages={percentages}
                       {...props}/></div>
        
    );
}))

const ChartCard = withStyles(cardChartStyle)( function({ classes, record={}, ...props }){
  const {fields, stats, selected_field} = db_vals(props.selected_db, props)
  return(
    <Card className={classes.cardChart}>
      <Grid container 
        spacing={0}
        align="center"
        justify="center">
        <Grid item xs={12}>
          {stats===null ?
            <div className={classes.progress}>
              <CircularProgress />
            </div>:
            <PieChart stats={stats} {...props}/>
          }
        </Grid>
      </Grid>
    </Card>
  )
})

const Charts = withStyles(styles)( function({ classes, record={}, ...props }){
  
  const {fields, stats, selected_field} = db_vals(props.selected_db, props)
  
  return(
    <div className={classes.main}>
      <CardIcon Icon={DonutSmall} type={`${props.selected_db}CardHeader`} />
      <Card className={`${classes.card}`}>
        {fields===null ?
          <div className={classes.ProgressContainer}>
            <LinearProgress/>
          </div>:
          <Selections
            value={selected_field === null ? fields[0]: selected_field}
            values={Object.keys(fields).sort()}
            onChange={e => props.handleSelectField(e, props.selected_db)}
          />
        }
        <ChartCard {...props}/>
      </Card>
    </div>
  )
})

export const Dashboard = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12} lg={7}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={4}>
                  <Stat type={"Libraries"} {...props} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stat type={"Signatures"} {...props} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stat type={"Entities"} {...props} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={6}>
                  <Charts selected_db={"Libraries"} {...props} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Charts selected_db={"Signatures"} {...props} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item sm={6} xs={12}>
                  <Stat type={"Stats"} {...props} />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <PopularGenes {...props} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
})