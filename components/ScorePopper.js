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
    if (sorted===null || scores[sorted]===undefined){
      sorted = Object.keys(scores)[0]
    }
    return(
      <div>
        <Button
          aria-owns={this.state.anchorEl ? 'simple-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          style={{width:50}}
        >
          <Typography style={{
              fontSize: 15, 
              width: 100,
              textAlign: "left"
            }} 
            variant="subtitle2">
            <Icon className={`${classes.menuIcon} mdi mdi-18px ${scores[sorted].icon || 'mdi-trophy-award'}`} />
                &nbsp;
            <Typography style={{ fontSize: 10, display: "block", width: 20, overflow: "visible" }} variant="caption" display="block">
              {`${scores[sorted].label}:`}
            </Typography>
            {scores[sorted].value}
          </Typography>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          {Object.keys(scores).map(key=>(
            <MenuItem onClick={()=>{
              if (sortBy!==undefined) sortBy(key)
              this.handleClose()
            }}
            key={key}
            selected={sorted===key}
            >
              <Icon className={`${classes.menuIcon} mdi mdi-18px ${scores[key].icon || 'mdi-trophy-award'}`} />
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                {`${scores[key].label}: ${scores[key].value}`}
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
  classes: PropTypes.object,
};