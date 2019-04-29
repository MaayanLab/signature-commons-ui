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
import Refresh from '@material-ui/icons/Refresh';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { DonutChart } from "./VXpie.js";
import { withScreenSize } from '@vx/responsive';
import withWidth from '@material-ui/core/withWidth';
import Button from '@material-ui/core/Button';


// import DonutChart from "./Donut.js";

import { cardIconStyle } from '../../styles/jss/components/CardIconStyle.js'
import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'
import { styles } from '../../styles/jss/theme.js'

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
}


export const ListItemLink = (props) => (
    <ListItem button component="a" {...props} />
  )

export const CardIcon = withStyles(cardIconStyle)(({ Icon, classes, type }) => (
    <Card className={`${classes.cardIcon} ${classes[type]}`}>
        <Icon className={classes.icon} />
    </Card>
));

const db_vals = (db, props) => {
  const vals = {
    Libraries: {
      fields: props.library_piefields,
      stats: props.libchart,
      selected_field: props.libselected,
      icon : LibraryBooks,
      num : props.LibraryNumber,
      title: "Library Stats"
    },
    Signatures: {
      fields: props.signature_piefields,
      stats: props.sigchart,
      selected_field: props.sigselected,
      icon : Fingerprint,
      num : props.SignatureNumber,
      title: "Signature Stats"
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

const StatTable = withStyles(styles)( function({ classes, record={}, ...props }){
  const {fields, signature_counts} = props
  if(signature_counts === null){
    return(
      <Table className={classes.table}>
        <TableBody>
          {Object.keys(fields).map((key) => (
            <TableRow key={`${key}_key`}>
              <TableCell component="th" scope="row">
                {key.replace("_","")}
              </TableCell>
              <TableCell align="center">Loading...</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }else{
    return(
      <Table className={classes.table}>
        <TableBody>
          {signature_counts.map((entry) => (
            <TableRow key={`${entry.name}_entry`}>
              <TableCell component="th" scope="row">
                {entry.name.replace("_"," ")}
              </TableCell>
              <TableCell align="center">{entry.counts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
})

export const Stat = withStyles(styles)( function({ classes, record={}, ...props }){
    if(props.type!=="Stats"){
      const {icon, num} = db_vals(props.type, props)
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.color}CardHeader`} />
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
      if(props.fields!==null){
        return(
          <div className={classes.main}>
            <CardIcon Icon={icon} type={`${props.color}CardHeader`} />
            <Card className={classes.longcard}>
                <Typography variant="headline" className={classes.namebox} component="h5">
                    {props.name}
                </Typography>
                <Divider />
                <StatTable {...props}/>
            </Card>
          </div>
        )
      }else{
        return(<div/>)
      }
    }
  })

const PopularGenes = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <div className={classes.main}>
      <CardIcon Icon={Whatshot} type={`${props.color}CardHeader`} />
      <Card className={classes.longcard}>
          <Typography variant="headline" className={classes.namebox} component="h5">
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

export const Selections = withStyles(styles)( function({ classes, record={}, ...props }){
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

export const PieChart = withStyles(styles)( function({ classes, record={}, ...props }){
    
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
    var true_values = included.map((entry)=>(
                        {label:entry.label, value: entry.value}
                      ))
    true_values = true_values.concat({label:"others",value: other})

    data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    true_values.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    let width = 220
    let height = 220
    let radius= 150
    let fontSize = 7
    if(props.cardheight ==300){
      radius=200
      width=300
      height=300
      fontSize=10
    }
    return(
      <div><DonutChart width={width}
                       height={height}
                       radius={radius}
                       fontSize={fontSize}
                       margin={{
                          "top":10,
                          "bottom":10,
                          "left":10,
                          "right":10}}
                       data={data}
                       true_values={true_values}
                       {...props}/></div>
        
    );
})

const ChartCard = withStyles(cardChartStyle)( function({ classes, ...props }){
  const {piefields,
         pie_stats,
         cardheight,
         selected_field} = props
  return(
    <Card className={classes.cardChart} style={{height:cardheight}} {...props}>
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

export const Charts = withScreenSize(withStyles(styles)( function({ classes, ...props }){
  
  const {piefields,
         pie_stats,
         pie_name,
         selected_field,
         longcard,
         color,
         ExtraComponent} = props
  const card_class = longcard ? `${classes.longcard}` : `${classes.card}`
  const cardheight = (props.screenWidth>1490 || props.screenWidth<600) ? 300:225
  const propstopass = {
      piefields,
      pie_stats,
      cardheight,
      selected_field,
      color,
    }
  return(
    <div className={classes.main}>
      <CardIcon Icon={DonutSmall} type={`${color}CardHeader`} />
      <Card className={card_class}>
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
        <ChartCard selected_db="Entities" cardheight={cardheight} {...propstopass}/>
        {ExtraComponent===undefined ? null: <ExtraComponent {...props}/>}
      </Card>
    </div>
  )
}))

// const ChartCard = withStyles(cardChartStyle)( function({ classes, record={}, ...props }){
//   const {fields, stats, selected_field, title} = db_vals(props.selected_db, props)
//   const display_title = fields === null? <div/> : title.replace(/_/g, " ")
//   return(
//     <Card className={classes.cardChart}>
//       <Grid container 
//         spacing={0}
//         direction={"column"}
//         align="center"
//         justify="center">
//         <Grid item xs={12}>
//           {selected_field.replace(/_/g, " ")}
//         </Grid>
//         <Grid item xs={12}>
//           {stats===null ?
//             <div className={classes.progress}>
//               <CircularProgress />
//             </div>:
//             <PieChart stats={stats} {...props}/>
//           }
//         </Grid>
//       </Grid>
//     </Card>
//   )
// })

// const Charts = withStyles(styles)( function({ classes, record={}, ...props }){
  
//   const {fields, stats, selected_field} = db_vals(props.selected_db, props)
  
//   return(
//     <div className={classes.main}>
//       <CardIcon Icon={DonutSmall} type={`${props.color}CardHeader`} />
//       <Card className={`${classes.card}`}>
//         {fields===null ?
//           <div className={classes.ProgressContainer}>
//             <LinearProgress/>
//           </div>:
//           <Selections
//             value={selected_field === null ? fields[0]: selected_field}
//             values={fields.sort()}
//             onChange={e => props.handleSelectField(e, props.selected_db)}
//           />
//         }
//         <ChartCard {...props}/>
//       </Card>
//     </div>
//   )
// })

export const CurrentVersion = withStyles(styles)(({classes, ...props}) => {
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

const TopCard = withStyles(styles)( function({ classes, record={}, ...props }){
  const date = new Date()
  return(
    <Card className={classes.topCard}>
      <Grid container spacing={24}>
        <Grid item xs={12} md={9} lg={8}>
          <Typography variant="headline" className={classes.bigtitle} component="h3">
            SIGNATURE COMMONS DASHBOARD
          </Typography>
        </Grid>
        <Grid item xs={12} md={3} lg={4}>
          {props.LibraryNumber > 0 && props.SignatureNumber > 0 && props.resource_signatures!==null ? 
            <CurrentVersion libraries_count={props.LibraryNumber}
                            signatures_count={props.SignatureNumber}
                            resources_count={Object.keys(props.resource_signatures).length}/>: null}
        </Grid>
      </Grid>
    </Card>
  )
})

export const Dashboard = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <TopCard {...props}/>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={6}>
                   <Charts piefields={props.piefields}
                          pie_stats={props.resource_signatures}
                          pie_name={"Resources"}
                          color={"Green"}
                          selected_field={props.selected_field}
                          handleSelectField={props.handleSelectField}
                          />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Charts piefields={props.piefields}
                          pie_stats={props.pie_stats}
                          color={"Purple"}
                          selected_field={props.selected_field}
                          handleSelectField={props.handleSelectField}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item md={6} xs={12}>
                  <Stat type="Stats"
                        fields={props.counting_fields}
                        signature_counts={props.meta_counts}
                        color={"Orange"}
                        name={"Stats"}
                        dense/>
                </Grid>
                <Grid item md={6} xs={12}>
                  <PopularGenes longcard color="Red" {...props} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
})