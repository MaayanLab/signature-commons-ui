import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from "react-redux";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const mapStateToProps = (state, ownProps) => {
  return { 
    ui_values: state.serverSideProps.ui_values,
  }
};

export function Nav(props) {
  const { ui_values, dispatch, location, ...rest } = props
  return (
    <ul {...rest}>
      {ui_values.nav.MetadataSearch && ui_values.nav.MetadataSearch.active ?
        <li
          className={location.pathname === `${ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}` ? 'active' : ''}
        >
          <Link to={`${ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}`}>
            {ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </li> : null
      }
      {ui_values.nav.SignatureSearch && ui_values.nav.SignatureSearch.active ?
        <li
          className={location.pathname === `${ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}` ? 'active' : ''}
        >
          <Link to={`${ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}`}>
            {ui_values.nav.SignatureSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </li> : null
      }
      {ui_values.nav.Resources && ui_values.nav.Resources.active ?
        <li
          className={location.pathname === `${ui_values.nav.Resources.endpoint || "/Resources"}` ? 'active' : ''}
        >
          <Link to={`${ui_values.nav.Resources.endpoint || "/Resources"}`}>
            {ui_values.preferred_name.resources || 'Resources'}
          </Link>
        </li> : null
      }
      <li
        className={location.pathname === '/API' ? '' : ''}
      >
        <Link to="/API">
          API
        </Link>
      </li>
    </ul>
  )
}


class Header extends React.Component {
  render = () => {
    const paths = this.props.location.pathname.split('/')
    const {staticContext, ...rest} = this.props
    return (
      <header>
        <nav className="nav-extended">
          <div className="nav-wrapper">
            <Link
              to="/"
              className="brand-logo left hide-on-med-and-down"
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; {this.props.ui_values.LandingText.header || 'Signature Commons'}
            </Link>
            <Link
              to="/"
              className={`brand-logo ${location} hide-on-large-only`}
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; {this.props.ui_values.LandingText.header || 'Signature Commons'}
            </Link>
            <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
            <Nav id="nav-mobile" className="right hide-on-med-and-down" {...rest} />
          </div>
          <Nav className="sidenav" id="mobile-menu" {...rest}/>
        </nav>
      </header>
    )
  }
}

export default connect(mapStateToProps)(Header)
