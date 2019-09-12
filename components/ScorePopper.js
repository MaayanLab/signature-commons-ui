import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

export default class ScorePopper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      anchorEl: null,
    }
    console.log(props)
  }

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    })
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    })
  }

  render = () => {
    let {scores, score_icon, sorted, sortBy, classes} = this.props
    if (sorted===null){
      sorted = Object.keys(scores)[0]
    }
    console.log(scores)
    console.log(sorted)
    return(
      <div>
        <Button
          aria-owns={this.state.anchorEl ? 'simple-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <Typography style={{
              fontSize: 15, 
              width: 100, 
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "left"
            }} 
            variant="subtitle2">
            {`${sorted}: ${scores[sorted].value}`}
          </Typography>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          {Object.keys(scores).map(label=>(
            <MenuItem onClick={()=>{
              sortBy(label)
              this.handleClose()
            }} key={label}>
              <Icon className={`${classes.menuIcon} mdi mdi-18px ${scores[label].icon || 'mdi-trophy-award'}`} />
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                {`${label}: ${scores[label].value}`}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </div>
    )}
}

ScorePopper.propTypes = {
  scores: PropTypes.object.isRequired,
  score_icon: PropTypes.string,
  sortBy: PropTypes.func,
  sorted: PropTypes.string,
  classes: PropTypes.func,
};