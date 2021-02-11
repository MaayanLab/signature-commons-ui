import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip';

export default class Downloads extends React.Component {
  constructor(props) {
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
    const { data } = this.props
    if (data.length === 1) {
      const {url, onClick, text, icon} = data[0]
      return (
        <Tooltip title={text} arrow>
          <Button
            onClick={() => {
              if (url){
                window.location = url
              }else {
                onClick()
              }
            }}
            style={{ width: 50, height: 50 }}
          >
            <Icon className={`mdi mdi-24px ${icon || 'mdi-download'}`} />
          </Button>
        </Tooltip>
      )
    } else {
      return (
        <div>
          <Button
            aria-owns={this.state.anchorEl ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleClick}
            style={{ width: 50, height: 50 }}
          >
            <Icon className={`mdi mdi-24px ${data.length>0?'mdi-download': data[0].icon}`} />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            {data.map(({url, onClick, text, icon}) => (
              <MenuItem onClick={() => {
                this.handleClose()
                if (url){
                  window.location = data[0].url
                }else onClick()
              }}
              key={text}
              >
                <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                  <Icon className={`mdi mdi-18px ${icon || 'mdi-download'}`} /> &nbsp; {`Download ${text}`}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </div>
      )
    }
  }
}

Downloads.propTypes = {
  data: PropTypes.arrayOf(PropTypes.oneOf([
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      icon: PropTypes.string,
    }),
    PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      text: PropTypes.string.isRequired,
      icon: PropTypes.string,
    }),
  ])).isRequired,
}
