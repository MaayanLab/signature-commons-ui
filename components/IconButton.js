import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
    textTransform: 'none',
    width: 100,
    minHeight: 100,
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'visible',
  },
  image: {
    height: 50,
  },
  margin: {
    margin: theme.spacing.unit * 2,
  },
});



const InformativeButton = (props) => {
  let {classes, counter, title, alt, src, description} = props
  let tooltip_title = ""
  if (description!==undefined) {
    tooltip_title = <Typography variant="subtitle2" style={{color:"#FFF"}} gutterBottom>
              {description}
            </Typography>
  }
  return(
    <Tooltip title={tooltip_title}
        placement="bottom">
      <Button className={classes.button} onClick={() => {if(props.onClick!== undefined) props.onClick(props.value)}}>
        <Badge className={classes.margin} max={9999} badgeContent={counter===undefined ? 0: counter} color="error">
          <Grid container>
            <Grid item xs={12}>
              <img className={classes.image} alt={alt} src={src}/>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {title}
              </Typography>
            </Grid>
          </Grid>
        </Badge>
      </Button>
    </Tooltip>
  )
}

export default withStyles(styles)(InformativeButton)