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
    maxWidth: 60,
    height: 50,
  },
  margin: {
    margin: theme.spacing.unit * 2,
  },
});



const InformativeButton = (props) => {
  let {classes, counter, title, alt, src, description} = props
  return(
    <Tooltip title={
        <Typography variant="subtitle2" style={{color:"#FFF"}} gutterBottom>
          {description}
        </Typography>||''}
        placement="bottom">
      <Button className={classes.button}>
        <Badge className={classes.margin} badgeContent={counter===undefined ? 0: counter} color="secondary">
          <Grid container>
            <Grid item xs={12}>
              <img className={classes.image} alt={alt} src={src}/>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {title || alt}
              </Typography>
            </Grid>
          </Grid>
        </Badge>
      </Button>
    </Tooltip>
  )
}

export default withStyles(styles)(InformativeButton)