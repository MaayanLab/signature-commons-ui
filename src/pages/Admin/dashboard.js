import React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { withStyles } from '@material-ui/core/styles';
import BlurOn from '@material-ui/icons/BlurOn';
import Fingerprint from '@material-ui/icons/Fingerprint';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Grade from '@material-ui/icons/Grade';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import * as d3 from "d3";
import sampPie from "./VXpie.js"


const styles = theme => ({
    root: {
      flexGrow: 1,
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
});

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
}


const CardIcon = withStyles(styles)(({ Icon, classes, bgColor }) => (
    <Card className={classes.cardicon} style={{ backgroundColor: bgColor }}>
        <Icon className={classes.icon} />
    </Card>
));

function Welcome(props){
    return(
      <Card>
        <CardHeader title={`Welcome to the Signature Commons Dashboard, ${props.name}!`} />
        <CardContent>Let's start exploring</CardContent>
      </Card>
    )
  }

const Stat = withStyles(styles)( function({ classes, record={}, ...props }){
    let icon = undefined
    let num = 0
    let background = undefined
    switch (props.type) {
      case "Libraries":
        icon = LibraryBooks;
        num = props.LibraryNumber;
        background = "#ff9800";
        break;
      case "Signatures":
        icon = Fingerprint;
        num = props.SignatureNumber;
        background = "#4caf50";
        break;
      case "Entities":
         icon = BlurOn;
         num = props.EntityNumber;
         background = "#f44336";
        break;
    }
    if(props.type!=="Signatures"){
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} bgColor={background} />
          <Card className={classes.card}>
              <Typography className={classes.title} color="textSecondary">
                  {props.type}
              </Typography>
              <Typography variant="headline" component="h2">
                  {num}
              </Typography>
          </Card>
        </div>
      )
    }else{
      return(
        <div className={classes.main}>
          <CardIcon Icon={icon} bgColor={background} />
          <Card className={classes.card}>
              <Typography className={classes.title} color="textSecondary">
                  {props.type}
              </Typography>
              <Typography variant="headline" component="h2">
                  {num}
              </Typography>
              <Divider />
              {props.signature_counts===null ?
                <div>
                {props.SignatureNumber==="Loading..."? null: 
                  <Typography variant="headline" component="h4">
                      {"Loading stats..."}
                  </Typography>
                }</div>:
                <List>
                  {Object.keys(props.signature_counts).map(key =>(
                    <ListItem>
                      <ListItemText
                        primary={key.replace("_"," ")}
                        secondary={props.signature_counts[key]}
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
      <CardIcon Icon={Grade} bgColor={"#31708f"} />
      <Card className={classes.card}>
          <Typography variant="headline" component="h2">
              Popular Genes
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
      label="Select"
      className={classes.textField}
      value={props.value}
      SelectProps={{
        MenuProps: {
          className: classes.menu,
        },
      }}
      helperText="Please select a field"
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
    stats.sort(function(x, y){
       return d3.descending(x.y, y.y);
    })
    var included = stats.slice(0,14)
    const included_sum = included.sum("value")
    const other = stats.slice(14,).sum("value")
    const other_sum = included_sum > other ? other: included_sum*0.9
    var others = [{"label": "others", "value":other_sum}]
    var data = other_sum >0 ? included.concat(others): included;
    data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    return(
      <div>{sampPie({"width":400,"height":400,"margin":{"top":10,"bottom":10,"left":10,"right":10}, "data": data})}</div>
        
    );
})

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
      <Card className={classes.card}>
          <Typography variant="headline" component="h2">
              Stats
          </Typography>
          <Divider />
          <Grid container spacing={24} container={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={6}>
                  <Selections
                    value={props.selected_db}
                    values={["Libraries","Signatures","Entities"]}
                    onChange={props.handleSelectDB}
                  />
                </Grid>
                <Grid item xs={6}>
                  {fields===null ?
                    <Typography variant="headline" component="h4">
                      {"Loading..."}
                    </Typography>:
                    <Selections
                      value={props.selected_field === null ? fields[0]: props.selected_field}
                      values={Object.keys(fields).sort()}
                      onChange={props.handleSelectField}
                    />
                  }
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {props.stats===null ?
                <Typography variant="headline" component="h4">
                  {"Loading..."}
                </Typography>:
                <PieChart {...props}/>
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
        <Grid item xs={12} md={6}>
          <Grid container spacing={24} direction={"column"}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                <Grid item xs={6}>
                  <Stat type={"Libraries"} {...props} />
                </Grid>
                <Grid item xs={6}>
                  <Stat type={"Entities"} {...props} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Welcome name={"Admin"} {...props} />
            </Grid>
            <Grid item xs={12}>
              <Charts {...props} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={24}>
            <Grid item xs={6}>
              <Stat type={"Signatures"} {...props} />
            </Grid>
            <Grid item xs={6}>
              <PopularGenes type={"Signatures"} {...props} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
})