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
import { DonutChart } from "./VXpie.js";


const colors = {
                "Libraries":"#50a050",
                "Entities": "#a03cb4",
                "Signatures": "#2198f3"
               }

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    progress: {
      margin: theme.spacing.unit * 2,
    },
    main: {
        flex: '1',
        marginRight: '1em',
        marginTop: 20,
    },
    card: {
      overflow: 'inherit',
      textAlign: 'right',
      padding: 16,
      minHeight: 52,
    },
    piecard: {
      float: 'center',
      margin: '5px',
      padding: '20px 5px 5px 5px',
      zIndex: 100,
      borderRadius: 3,
    },
    cardicon: {
      float: 'left',
      margin: '-20px 20px 0 15px',
      zIndex: 100,
      borderRadius: 3,
    },
    icon: {
      float: 'right',
      width: 54,
      height: 54,
      padding: 14,
      color: '#fff',
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 200,
    },
    menu: {
      width: 200,
    },
    Libraries: {
      backgroundColor: "#50a050",
    },
    Entities: {
      backgroundColor: "#a03cb4",
    },
    Signatures: {
      backgroundColor: "#2198f3",
    },
    chartCard: {
      backgroundColor: "#2198f3",
    },
    popularCard: {
      backgroundColor: "#e63c3c",
    },
    StatsCard: {
      backgroundColor: "#fa9614",
    },
});

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
}


const CardIcon = withStyles(styles)(({ Icon, classes, type }) => (
    <Card className={`${classes.cardicon} ${classes[type]}`}>
        <Icon className={classes.icon} />
    </Card>
));

const Welcome = withStyles(styles)( function({ classes, record={}, ...props }){
    return(
      <div className={classes.main}>
        <Card>
          <CardHeader title={`Welcome to the Signature Commons Dashboard, ${props.name}!`} />
          <CardContent>Let's start exploring</CardContent>
        </Card>
      </div>
    )
  })

const Stat = withStyles(styles)( function({ classes, record={}, ...props }){
    let icon = undefined
    let num = 0
    let background = undefined
    switch (props.type) {
      case "Libraries":
        icon = LibraryBooks;
        num = props.LibraryNumber;
        break;
      case "Signatures":
        icon = Fingerprint;
        num = props.SignatureNumber;
        break;
      case "Entities":
         icon = BlurOn;
         num = props.EntityNumber;
        break;
      case "Stats":
        icon = Assessment
    }
    if(props.type!=="Stats"){
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.type}`} />
          <Card className={classes.card}>
              <Typography className={classes.title} color="textSecondary">
                  {props.type}
              </Typography>
              <Typography variant="headline" component="h4">
                  {num}
              </Typography>
          </Card>
        </div>
      )
    }else{
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.type}Card`} />
          <Card className={classes.card}>
              <Typography variant="headline" component="h4">
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
      <CardIcon Icon={Whatshot} type={"popularCard"} />
      <Card className={classes.card}>
          <Typography variant="headline" component="h4">
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

const PieChart = withStyles(styles)( function({ classes, record={}, ...props }){
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
    data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    return(
      <div><DonutChart style={{"width":350 ,
                               "height":350,
                               "margin":{
                                  "top":10,
                                  "bottom":10,
                                  "left":10,
                                  "right":10}}}
                        data={data}
                        {...props}/></div>
        
    );
})

const PieCard = withStyles(styles)(({classes, ...props }) => (
    <Card className={classes.piecard}>
        <PieChart {...props}/>
    </Card>
));

const Charts = withStyles(styles)( function({ classes, record={}, ...props }){
  let fields=undefined
  switch (props.selected_db) {
      case "Libraries":
        fields=props.library_fields
        break;
      case "Signatures":
        fields=props.signature_allfields
        break;
      case "Entities":
        fields=props.entity_fields
        break;
    }
  return(
    <div className={classes.main}>
      <CardIcon Icon={DonutSmall} type={`${props.selected_db}`} />
      <Card className={classes.card}>
          <Typography variant="headline" component="h4">
              Charts
          </Typography>
          <Divider />
          <Grid container 
                spacing={24}
                container={"column"}>
            <Grid item sm={12}>
              <Grid container spacing={24}>
                <Grid item xs={6}>
                  <Selections
                    value={props.selected_db}
                    values={["Libraries","Signatures","Entities"]}
                    onChange={props.handleSelectDB}
                    name={"Database"}
                  />
                </Grid>
                <Grid item xs={6}>
                  {fields===null ?
                    <Grid container 
                      spacing={0}
                      align="center"
                      justify="center">
                      <Grid item xs={12}>
                        <CircularProgress className={classes.progress} />
                      </Grid>
                    </Grid>:
                    <Selections
                      value={props.selected_field === null ? fields[0]: props.selected_field}
                      values={Object.keys(fields).sort()}
                      onChange={props.handleSelectField}
                      name="Key"
                    />
                  }
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12}>
              {props.stats===null ?
                <div>
                  {fields===null ? <div/> :
                    <Grid container 
                      spacing={0}
                      align="center"
                      justify="center">
                      <Grid item xs={12}>
                        <CircularProgress className={classes.progress} />
                      </Grid>
                    </Grid>
                  }
                </div>:
                <PieCard {...props}/>
              }
            </Grid>
          </Grid>
      </Card>
    </div>
  )
})

export const Dashboard = withStyles(styles)( function({ classes, record={}, ...props }){
  return(
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12} md={9} lg={6}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={4}>
                  <Stat type={"Libraries"} {...props} />
                </Grid>
                <Grid item xs={4}>
                  <Stat type={"Signatures"} {...props} />
                </Grid>
                <Grid item xs={4}>
                  <Stat type={"Entities"} {...props} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Charts {...props} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={3} lg={6}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item lg={6} md={12} xs={6}>
                  <Stat type={"Stats"} {...props} />
                </Grid>
                <Grid item lg={6} md={12} xs={6}>
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