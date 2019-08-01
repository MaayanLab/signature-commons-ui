import React from 'react'
import { withRouter, Link } from 'react-router-dom'

export function Nav(props) {
  const { ui_values, handleChange, staticContext, ...rest } = props
  return (
    <ul {...rest}>
      {ui_values.nav.metadata_search ?
        <li
          className={rest.location.pathname === '/MetadataSearch' ? 'active' : ''}
        >
          <Link to={rest.location.pathname === '/MetadataSearch' ? '/MetadataSearch' : '/'}
            onClick={(e) => {
              handleChange(e, 'metadata', true)
            }}
          >
            Metadata Search
          </Link>
        </li> : null
      }
      {ui_values.nav.signature_search ?
        <li
          className={rest.location.pathname === '/SignatureSearch' ? 'active' : ''}
        >
          <Link to={rest.location.pathname === '/SignatureSearch' ? '/SignatureSearch' : '/'}
            onClick={(e) => {
              handleChange(e, 'signature', true)
            }}
          >
            Signature Search
          </Link>
        </li> : null
      }
      {ui_values.nav.resources ?
        <li
          className={rest.location.pathname === `/${ui_values.preferred_name.resources || 'Resources'}` ? 'active' : ''}
        >
          <Link to={`/${ui_values.preferred_name.resources || 'Resources'}`}>
            {ui_values.preferred_name.resources || 'Resources'}
          </Link>
        </li> : null
      }
      <li
        className={rest.location.pathname === '/API' ? 'active' : ''}
      >
        <Link to="/API">
          API
        </Link>
      </li>
    </ul>
  )
}


export default withRouter((props) => {
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
            &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; {props.ui_values.LandingText.header || 'Signature Commons'}
          </Link>
          <Link
            to="/"
            className={`brand-logo ${location} hide-on-large-only`}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; Signature Commons
          </Link>
          <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          <Nav id="nav-mobile" className="right hide-on-med-and-down" {...props} />
        </div>
        <Nav className="sidenav" id="mobile-menu" {...props}/>

        {paths.length <= 2 ? null : (
          <div className="nav-wrapper grey">
            <div className="row">
              <div className="col s12">
                {paths.slice(1).map((path, i) => {
                  const href = paths.slice(0, i + 2).join('/')
                  return (
                    <Link
                      key={href}
                      to={href}
                      className="breadcrumb"
                    >
                      {path.replace(/_/g, ' ')}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
})
