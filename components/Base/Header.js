import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Breadcrumbs from '@material-ui/lab/Breadcrumbs'
import Hidden from '@material-ui/core/Hidden'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import MenuIcon from '@material-ui/icons/Menu'
import { makeTemplate } from '../../util/makeTemplate'

const mapStateToProps = (state, ownProps) => {
  return {
    ui_values: state.ui_values,
  }
}

const styles = (theme) => ({
  grow: {
    flexGrow: 1,
  },
  header: {
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  breadcrumb: {
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  link: {
    color: 'inherit',
  },
  menuItem: {
    color: 'inherit',
  },
  paper: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  menuButton: {
    margin: 0,
  },
})

export const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />
}

export function Nav(props) {
  const { ui_values, location, classes } = props
  return (
    <React.Fragment>
      {ui_values.nav.MetadataSearch.active ?
        <ListItemLink
          selected={location.pathname === `${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}
          className={classes.menuItem}
          href={`#${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}
        >
          {ui_values.nav.MetadataSearch.navName || ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
        </ListItemLink> : null
      }
      {ui_values.nav.SignatureSearch.active ?
        <ListItemLink
          selected={location.pathname === `${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
          className={ classes.menuItem}
          href={`#${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
        >
          {ui_values.nav.SignatureSearch.navName || ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
        </ListItemLink> : null
      }
      {ui_values.nav.Resources.active ?
        <ListItemLink
          selected={location.pathname === `${ui_values.nav.Resources.endpoint || '/Resources'}`}
          className={ classes.menuItem}
          href={`#${ui_values.nav.Resources.endpoint || '/Resources'}`}
        >
          {ui_values.nav.Resources.navName || ui_values.nav.Resources.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
        </ListItemLink> : null
      }
      {ui_values.about !== undefined ?
        <ListItemLink
          selected={location.pathname === '/About'}
          className={ classes.menuItem}
          href={'#/About'}
        >
          {'About'}
        </ListItemLink> : null
      }
      <ListItemLink
        selected={location.pathname === '/Notebook'}
        className={ classes.menuItem}
        href={'#/Notebook'}
      >
        {'LymeMIND2 Analysis'}
      </ListItemLink>
      <ListItemLink
        selected={location.pathname === '/Viewer'}
        className={ classes.menuItem}
        href={'#/Viewer'}
      >
        {'LymeMIND2 Viewer'}
      </ListItemLink>
      <ListItemLink
        selected={location.pathname === '/API'}
        className={ classes.menuItem}
        href={'#/API'}
      >
        {'API'}
      </ListItemLink>
      <ListItemLink
        selected={location.pathname === '/Help'}
        className={ classes.menuItem}
        href={'#/Help'}
      >
        {'Help'}
      </ListItemLink>
    </React.Fragment>
  )
}

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }

  toggleDrawer = () => {
    this.setState((prevState) => ({
      open: !prevState.open,
    }))
  };

  render = () => {
    const paths = this.props.location.pathname.split('/')
    const { staticContext, classes, ...rest } = this.props
    return (
      <header {...this.props.ui_values.header_info.header_props}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Hidden smDown>
              { [this.props.ui_values.nav.MetadataSearch.endpoint, this.props.ui_values.nav.SignatureSearch.endpoint + '/Overlap', this.props.ui_values.nav.SignatureSearch.endpoint + '/Rank'].indexOf(this.props.location.pathname) > -1 ?
                <div className={classes.grow}/> :
                <Typography variant="h4" color="inherit" className={classes.grow}>
                  <Link
                    to="/"
                    className={classes.header}
                  >
                    {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={makeTemplate(this.props.ui_values.header_info.icon.src, {})} />{this.props.ui_values.header_info.header_right}
                  </Link>
                </Typography>
              }
              <List
                {...this.props.ui_values.header_info.menu_props}
              >
                <Nav classes={classes} {...rest}/>
              </List>
            </Hidden>
            <Hidden mdUp>
              <Button edge="start" className={classes.menuButton} onClick={this.toggleDrawer} color="inherit" aria-label="menu">
                <MenuIcon />
              </Button>
              {[this.props.ui_values.nav.MetadataSearch.endpoint, this.props.ui_values.nav.SignatureSearch.endpoint + '/Overlap', this.props.ui_values.nav.SignatureSearch.endpoint + '/Rank'].indexOf(this.props.location.pathname) > -1 ?
                <div className={classes.grow}/> :
                <Typography variant="h4" color="inherit" className={classes.grow}>
                  <Link
                    to="/"
                    className={classes.header}
                  >
                    {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={makeTemplate(this.props.ui_values.header_info.icon.src, {})} />{this.props.ui_values.header_info.header_right}
                  </Link>
                </Typography>
              }
              <SwipeableDrawer
                open={this.state.open}
                onClose={this.toggleDrawer}
                onOpen={this.toggleDrawer}
              >
                <div
                  tabIndex={0}
                  role="button"
                  onClick={this.toggleDrawer}
                  onKeyDown={this.toggleDrawer}
                >
                  <List>
                    <Nav classes={classes} {...rest}/>
                  </List>
                </div>
              </SwipeableDrawer>
            </Hidden>
          </Toolbar>
        </AppBar>
        {paths.length <= 3 ? null : (
            <Breadcrumbs separator="›" aria-label="breadcrumb" component={'div'}>
              {paths.slice(1).map((path, i) => {
                const href = paths.slice(0, i + 2).join('/')
                return (
                  <Typography variant="h6" color={'inherit'} key={href}>
                    <Link
                      key={href}
                      to={href}
                      className={classes.breadcrumb}
                    >
                      {path.replace(/_/g, ' ')}
                    </Link>
                  </Typography>
                )
              })}
            </Breadcrumbs>
        )}
      </header>
    )
  }
}


export default connect(mapStateToProps)(withStyles(styles)(Header))
