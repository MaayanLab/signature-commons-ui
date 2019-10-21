import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => {
  return { 
    ui_values: state.serverSideProps.ui_values,
  }
};

export function Nav(props) {
  const { ui_values, dispatch, ...rest } = props
  return (
    <ul {...rest}>
      {ui_values.nav.MetadataSearch && ui_values.nav.MetadataSearch.active ?
        <li
          className={rest.location.pathname === `${ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}` ? '' : ''}
        >
          <Link to={`${ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}`}>
            {ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </li> : null
      }
      {ui_values.nav.SignatureSearch && ui_values.nav.SignatureSearch.active ?
        <li
          className={rest.location.pathname === `${ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}` ? '' : ''}
        >
          <Link to={`${ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}`}>
            {ui_values.nav.MetadataSearch.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2')}
          </Link>
        </li> : null
      }
      {ui_values.nav.Resources && ui_values.nav.Resources.active ?
        <li
          className={rest.location.pathname === `${ui_values.nav.Resources.endpoint || "/Resources"}` ? '' : ''}
        >
          <Link to={`${ui_values.nav.Resources.endpoint || "/Resources"}`}>
            {ui_values.preferred_name.resources || 'Resources'}
          </Link>
        </li> : null
      }
      <li
        className={rest.location.pathname === '/API' ? '' : ''}
      >
        <Link to="/API">
          API
        </Link>
      </li>
    </ul>
  )
}


const Header = (props) => {
  const paths = props.location.pathname.split('/')
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
            &nbsp;&nbsp; b<img src={`${process.env.PREFIX}/static/favicon.ico`} height="30" />ools
          </Link>
          <Link
            to="/"
            className={`brand-logo ${location} hide-on-large-only`}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            &nbsp;&nbsp;  b<img src={`${process.env.PREFIX}/static/favicon.ico`} height="30" />ools
          </Link>
          <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <Nav id="nav-mobile" className="right hide-on-med-and-down" {...props} />
        </div>
        <Nav className="sidenav" id="mobile-menu" {...props}/>
      </nav>
    </header>
  )
}

export default connect(mapStateToProps)(withRouter(Header))
