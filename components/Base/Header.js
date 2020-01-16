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
import Paper from '@material-ui/core/Paper';
import Hidden from '@material-ui/core/Hidden';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import MenuIcon from '@material-ui/icons/Menu';
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
    color: "inherit"
  },
  paper: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  menuButton: {
    margin: 0,
  },
});

export function Nav(props) {
  const { ui_values, location, classes } = props
  return (
    <React.Fragment>
      {ui_values.nav.MetadataSearch && ui_values.nav.MetadataSearch.active ?
        <MenuItem
          selected={location.pathname === `${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}
          className={classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}`}>
            {ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </MenuItem> : null
      }
      {ui_values.nav.SignatureSearch && ui_values.nav.SignatureSearch.active ?
        <MenuItem
          selected={location.pathname === `${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}
          className={ classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}`}>
            {ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </MenuItem> : null
      }
      {ui_values.nav.Resources && ui_values.nav.Resources.active ?
        <MenuItem
          selected={location.pathname === `${ui_values.nav.Resources.endpoint || '/Resources'}`}
          className={classes.menuItem}
        >
          <Link className={classes.link} to={`${ui_values.nav.Resources.endpoint || '/Resources'}`}>
            {ui_values.nav.Resources.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </MenuItem> : null
      }
      <MenuItem
        selected={location.pathname === '/Workflows'}
        className={classes.menuItem}
      >
        <Link className={classes.link} to="/Workflows">
          Workflows
        </Link>
      </MenuItem>
      <MenuItem
        selected={location.pathname === '/API'}
        className={classes.menuItem}
      >
        <Link className={classes.link} to="/API">
          API
        </Link>
      </MenuItem>
    </React.Fragment>
  )
}

class Header extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
    }
  }

  toggleDrawer = () => {
    console.log("Here")
    this.setState(prevState =>({
      open: !prevState.open,
    }));
  };

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
                    {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={`${process.env.PREFIX}${this.props.ui_values.header_info.icon.src}`} />{this.props.ui_values.header_info.header_right}
                    </Link>
                  </Typography>
                }
                <Nav classes={classes} {...rest}/>
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
                  {this.props.ui_values.header_info.header_left}<img {...this.props.ui_values.header_info.icon} src={`${process.env.PREFIX}${this.props.ui_values.header_info.icon.src}`} />{this.props.ui_values.header_info.header_right}
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
                  <MenuList>
                    <Nav classes={classes} {...rest}/>
                  </MenuList>
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


// class Header extends React.Component {
//   render = () => {
//     const paths = this.props.location.pathname.split('/')
//     const { staticContext, ...rest } = this.props
//     return (
//       <header>
//         <nav className="nav-extended">
//           <div className="nav-wrapper">
//             <Link
//               to="/"
//               className="brand-logo left hide-on-med-and-down"
//               style={{
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               &nbsp;&nbsp; <img src={`${process.env.PREFIX}${this.props.ui_values.favicon.icon}`} width={this.props.ui_values.favicon.width} />&nbsp; {this.props.ui_values.header_info || 'Signature Commons'}
//             </Link>
//             <Link
//               to="/"
//               className={`brand-logo ${location} hide-on-large-only`}
//               style={{
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               &nbsp;&nbsp; <img src={`${process.env.PREFIX}${this.props.ui_values.favicon.icon}`} width={this.props.ui_values.favicon.width} />&nbsp; {this.props.ui_values.header_info || 'Signature Commons'}
//             </Link>
//             <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
//             <Nav id="nav-mobile" className="right hide-on-med-and-down" {...rest} />
//           </div>
//           <Nav className="sidenav" id="mobile-menu" {...rest}/>
//         </nav>
//       </header>
//     )
//   }
// }

export default connect(mapStateToProps)(withStyles(styles)(Header))