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
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Hidden from '@material-ui/core/Hidden'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import MenuIcon from '@material-ui/icons/Menu'
import { makeTemplate } from '../../util/ui/makeTemplate'

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
    paddingLeft: 30,
    paddingRight: 30
  },
  paper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
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
          <Typography variant={'button'} style={{fontSize: 20}}>
            {ui_values.nav.MetadataSearch.navName || ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Typography>
        </ListItemLink> : null
      }
      {ui_values.nav.SignatureSearch.active ?
        <ListItemLink
          selected={location.pathname === `${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
          className={ classes.menuItem}
          href={`#${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
        >
          <Typography variant={'button'} style={{fontSize: 20}}>
            {ui_values.nav.SignatureSearch.navName || ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Typography>
        </ListItemLink> : null
      }
      {ui_values.nav.Resources.active ?
        <ListItemLink
          selected={location.pathname === `${ui_values.nav.Resources.endpoint || '/Resources'}`}
          className={ classes.menuItem}
          href={`#${ui_values.nav.Resources.endpoint}`}
        >
          <Typography variant={'button'} style={{fontSize: 20}}>
            {ui_values.nav.Resources.navName || ui_values.nav.Resources.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Typography>
        </ListItemLink> : null
      }
      <ListItemLink
        className={ classes.menuItem}
        href={'https://appyters.maayanlab.cloud/Drugmonizome_ML/'}
      >
          <Typography variant={'button'} style={{fontSize: 20}}>
            Drugmonizome ML
          </Typography>
      </ListItemLink>
      <ListItemLink
        selected={location.pathname === '/API'}
        className={ classes.menuItem}
        href={'#/API'}
      >
         <Typography variant={'button'} style={{fontSize: 20}}>
            API
          </Typography>
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
        <AppBar position="static" color="primary" style={{height: 80, paddingTop: 5, paddingBottom: 5}}>
          <Toolbar>
            <Hidden smDown>
              <Typography variant="h3" color="inherit" className={classes.grow}>
                <Link
                  to="/"
                  className={classes.header}
                >
                  {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={makeTemplate(this.props.ui_values.header_info.icon.src, {})} />{this.props.ui_values.header_info.header_right}
                </Link>
              </Typography>
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
                <Typography variant="h3" color="inherit" className={classes.grow}>
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
                  <List disablePadding>
                    <Nav classes={classes} {...rest}/>
                  </List>
                </div>
              </SwipeableDrawer>
            </Hidden>
          </Toolbar>
        </AppBar>
        {paths.length <= 3 ? <div style={{height:30}}/> : (
            <Breadcrumbs separator={<span className="mdi mdi-arrow-right-bold-circle-outline"/>} aria-label="breadcrumb" component={'div'} style={{marginTop:10, marginLeft: 20, height: 20}}>
              {paths.slice(1).map((path, i) => {
                const href = paths.slice(0, i + 2).join('/')
                return (
                  <Typography color={'inherit'} key={href} variant={"caption"}>
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
