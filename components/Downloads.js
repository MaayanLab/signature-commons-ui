import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'

export default class Downloads extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
    }
  }

  handleClick = (event) => {
    console.log(this.props.data)
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
      return (
        <Button
          onClick={() => window.location = data[0].hyperlink}
          style={{ width: 50, height: 50 }}
        >
          <Icon className={`mdi mdi-24px ${data[0].icon || 'mdi-download'}`} />
        </Button>
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
            <Icon className={`mdi mdi-24px ${data[0].icon || 'mdi-download'}`} />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            {data.map((d) => (
              <MenuItem onClick={() => {
                this.handleClose()
                window.location = d.hyperlink
              }}
              key={d.text}
              >
                <Icon className={`mdi mdi-18px ${d.icon || 'mdi-download'}`} />
                              &nbsp;
                <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                  {`Download ${d.text}`}
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
  data: PropTypes.arrayOf(PropTypes.shape({
    hyperlink: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.string,
  })).isRequired,
}
