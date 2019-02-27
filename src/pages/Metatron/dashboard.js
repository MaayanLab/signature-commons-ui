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


const styles = {
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
};

const CardIcon = withStyles(styles)(({ Icon, classes, bgColor }) => (
    <Card className={classes.cardicon} style={{ backgroundColor: bgColor }}>
        <Icon className={classes.icon} />
    </Card>
));

function Welcome(props){
    return(
      <Card>
        <CardHeader title={`Welcome ${props.name}!`} />
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
              {props.signature_stats===null ?
                <div>
                {props.SignatureNumber==="Loading..."? null: 
                  <Typography variant="headline" component="h4">
                      {"Loading stats..."}
                  </Typography>
                }</div>:
                <List>
                  {Object.keys(props.signature_stats).map(key =>(
                    <ListItem>
                      <ListItemText
                        primary={key.replace("_"," ")}
                        secondary={props.signature_stats[key]["[array]"]}
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