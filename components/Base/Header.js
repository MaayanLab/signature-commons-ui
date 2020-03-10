import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Breadcrumbs from '@material-ui/lab/Breadcrumbs';
import Hidden from '@material-ui/core/Hidden';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';

import { makeTemplate } from '../../util/makeTemplate'

const mapStateToProps = (state, ownProps) => {
  return {
    ui_values: state.ui_values,
  }
}

const styles = theme => ({
  grow: {
    flexGrow: 1,
  },
  header: {
    whiteSpace: 'nowrap',
    color: "inherit"
  },
  breadcrumb: {
    whiteSpace: 'nowrap',
    color: "inherit"
  },
  link: {
    color: "inherit"
  },
  menuItem: {
    color: "inherit",
  },
  paper: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  menuButton: {
    margin: 0,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});
export function NavList(props) {
  const { 
    location,
    classes,
    openMenuNotebook,
    openMenuVisualization,
    toggleDrawer,
    handleClick } = props

    return (
      <React.Fragment>
        <ListItem
          button
          className={classes.menuItem}
          onClick={() => handleClick("notebook")}
        >
          Notebooks
        </ListItem>
        <Collapse in={openMenuNotebook} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              onClick={toggleDrawer}
              selected={location.pathname === '/RNASeq'}
              className={classes.nested}
            >
              <Link className={classes.link} to={'/RNASeq'}>
                RNA-Seq Notebooks
              </Link>
            </ListItem>
            <ListItem
              onClick={toggleDrawer}
              selected={location.pathname === '/RPPA'}
              className={classes.nested}
            >
              <Link className={classes.link} to={'/RPPA'}>
                RPPA Notebooks
              </Link>
            </ListItem> 
          </List>
        </Collapse>
        <ListItem
          button
          className={classes.menuItem}
          onClick={() => handleClick("visualization")}
        >
          Visualizations
        </ListItem>
        <Collapse in={openMenuVisualization} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              onClick={toggleDrawer}
              selected={location.pathname === '/Network'}
              className={classes.nested}
            >
              <Link className={classes.link} to={'/Network'}>
                Integrative Networks
              </Link>
            </ListItem>
            <ListItem
              onClick={toggleDrawer}
              selected={location.pathname === '/Visualizations'}
              className={classes.nested}
            >
              <Link className={classes.link} to={'/Visualizations'}>
                GIVWE Visualizations
              </Link>
            </ListItem>
          </List>
        </Collapse>
      </React.Fragment>
    )
}

export function NavMenu(props) {
  const { 
    location,
    classes,
    openMenuNotebook,
    openMenuVisualization,
    handleClick,
    handleClose,
    setAnchorEl,
    anchorElNotebook,
    anchorElVisualization
   } = props
    return (
      <React.Fragment>
        <ListItem
          button
          className={classes.menuItem}
          buttonRef={node => {
            setAnchorEl(node, "notebook")
          }}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={() => handleClick("notebook")}
        >
          Notebooks
        </ListItem>
        <Popper open={openMenuNotebook} anchorEl={anchorElNotebook} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="menu-list-grow"
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={(event)=>{ handleClose(event, "notebook")}}>
                  <MenuList>
                    <MenuItem
                      onClick={(event)=>{ handleClose(event, "notebook")}}
                      selected={location.pathname === '/RNASeq'}
                      className={classes.nested}
                    >
                      <Link className={classes.link} to={'/RNASeq'}>
                        RNA-Seq Notebooks
                      </Link>
                    </MenuItem>
                    <MenuItem
                      onClick={(event)=>{ handleClose(event, "notebook")}}
                      selected={location.pathname === '/RPPA'}
                      className={classes.nested}
                    >
                      <Link className={classes.link} to={'/RPPA'}>
                        RPPA Notebooks
                      </Link>
                    </MenuItem> 
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        <ListItem
          button
          className={classes.menuItem}
          buttonRef={node => {
            setAnchorEl(node, "visualization")
          }}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={() => handleClick("visualization")}
        >
          Visualizations
        </ListItem>
        <Popper open={openMenuVisualization} anchorEl={anchorElVisualization} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="menu-list-grow"
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={(event)=>{ handleClose(event, "visualization")}}>
                  <MenuList>
                    <MenuItem
                      onClick={(event)=>{ handleClose(event, "visualization")}}
                      selected={location.pathname === '/Network'}
                      className={classes.nested}
                    >
                      <Link className={classes.link} to={'/Network'}>
                        Integrative Networks
                      </Link>
                    </MenuItem>
                    <MenuItem
                      onClick={(event)=>{ handleClose(event, "visualization")}}
                      selected={location.pathname === '/Visualizations'}
                      className={classes.nested}
                    >
                      <Link className={classes.link} to={'/Visualizations'}>
                        GIVWE Visualizations
                      </Link>
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </React.Fragment>
    )
}

export function Nav(props) {
  const { ui_values,
    location,
    classes,
    toggleDrawer,
    CustomComponent
   } = props
  return (
    <React.Fragment>
      {ui_values.nav.MetadataSearch && ui_values.nav.MetadataSearch.active ?
        <ListItem
          onClick={toggleDrawer}
          selected={location.pathname === `${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}
          className={classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}>
            {ui_values.nav.MetadataSearch.navName || ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Link>
        </ListItem> : null
      }
      {ui_values.nav.SignatureSearch && ui_values.nav.SignatureSearch.active ?
        <ListItem
          onClick={toggleDrawer}
          selected={location.pathname === `${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
          className={ classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}>
            {ui_values.nav.SignatureSearch.navName || ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Link>
        </ListItem> : null
      }
      {ui_values.nav.Resources && ui_values.nav.Resources.active ?
        <ListItem
          onClick={toggleDrawer}
          selected={location.pathname === `${ui_values.nav.Resources.endpoint || '/Resources'}`}
          className={classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.Resources.endpoint || '/Resources'}`}>
            {ui_values.nav.Resources.navName || ui_values.nav.Resources.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Link>
        </ListItem> : null
      }
      {CustomComponent !== undefined ? <CustomComponent {...props}/>: null}
      <ListItem
        onClick={toggleDrawer}
        selected={location.pathname === '/API'}
        className={classes.menuItem}
      >
        <Link className={classes.link} to="/API">
          API
        </Link>
      </ListItem> 
      {/* {ui_values.about !== undefined ?
        <ListItem
          onClick={toggleDrawer}
          selected={location.pathname === '/About'}
          className={classes.menuItem}
        >
          <Link className={classes.link} to={'/About'}>
            About
          </Link>
        </ListItem> : null
      } */}
    </React.Fragment>
  )
}

class Header extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      openMenuNotebook: false,
      openMenuVisualization: false
    }
  }

  handleClick = (menu) => {
    if (menu === "notebook"){
      this.setState(state => ({ openMenuNotebook: !state.openMenuNotebook }))
    } else if (menu === "visualization"){
      this.setState(state => ({ openMenuVisualization: !state.openMenuVisualization }))
    }
  }

  toggleDrawer = () => {
    this.setState(prevState =>({
      open: !prevState.open,
      openMenuNotebook: false,
      openMenuVisualization: false,
    }));
  }

  handleClose = (event, menu) => {
    if (menu === "notebook"){
      if (this.anchorElNotebook.contains(event.target)) {
        return;
      }
  
      this.setState({ openMenuNotebook: false });
    }else if (menu === "visualization"){
      if (this.anchorElVisualization.contains(event.target)) {
        return;
      }
  
      this.setState({ openMenuVisualization: false });
    }
  }

  setAnchorEl = (node, menu) => {
    if (menu === "notebook"){
      this.anchorElNotebook = node
    }else if (menu === "visualization"){
      this.anchorElVisualization = node
    }
  }

  render = () => {
    const paths = this.props.location.pathname.split('/')
    const { staticContext, classes, ...rest } = this.props
    return (
      <header>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Hidden smDown>
              { [this.props.ui_values.nav.MetadataSearch.endpoint, this.props.ui_values.nav.SignatureSearch.endpoint + "/Overlap", this.props.ui_values.nav.SignatureSearch.endpoint + "/Rank"].indexOf(this.props.location.pathname) > -1 ?
                <div className={classes.grow}/>:
                <Typography variant="h4" color="inherit" className={classes.grow}>
                    <Link
                      to="/"
                      className={classes.header}
                    >
                    {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={makeTemplate(this.props.ui_values.header_info.icon.src, {})} />{this.props.ui_values.header_info.header_right}
                    </Link>
                  </Typography>
                }
                <List style={{
                  display: 'flex',
                  whiteSpace: "nowrap",
                }}>
                  <Nav
                    classes={classes}
                    {...rest}
                    openMenuNotebook={this.state.openMenuNotebook}
                    openMenuVisualization={this.state.openMenuVisualization}
                    handleClick={this.handleClick}
                    toggleDrawer={this.toggleDrawer}
                    CustomComponent={NavMenu}
                    handleClose={this.handleClose}
                    setAnchorEl={this.setAnchorEl}
                    anchorElNotebook={this.anchorElNotebook}
                    anchorElVisualization={this.anchorElVisualization}
                  />
                </List>
              </Hidden>
              <Hidden mdUp>
              <Button edge="start" className={classes.menuButton} onClick={this.toggleDrawer} color="inherit" aria-label="menu">
                <MenuIcon />
              </Button>
              {[this.props.ui_values.nav.MetadataSearch.endpoint, this.props.ui_values.nav.SignatureSearch.endpoint + "/Overlap", this.props.ui_values.nav.SignatureSearch.endpoint + "/Rank"].indexOf(this.props.location.pathname) > -1 ?
                <div className={classes.grow}/>:
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
                >
                  <List>
                    <Nav
                      classes={classes}
                      {...rest}
                      openMenuNotebook={this.state.openMenuNotebook}
                      openMenuVisualization={this.state.openMenuVisualization}
                      handleClick={this.handleClick}
                      toggleDrawer={this.toggleDrawer}
                      CustomComponent={NavList}
                      handleClose={this.handleClose}
                    />
                  </List>
                </div>
              </SwipeableDrawer>
              </Hidden>
          </Toolbar>
        </AppBar>
        {paths.length <= 3 ? null : (
            <Breadcrumbs separator="›" aria-label="breadcrumb" component={"div"}>
              {paths.slice(1).map((path, i) => {
                const href = paths.slice(0, i + 2).join('/')
                return (
                  <Typography variant="h6" color={"inherit"} key={href}>
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