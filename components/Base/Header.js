import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { base_url as meta_base_url } from "../../util/fetch/meta";

export function Nav(props) {
  return (
    <ul {...props}>
      <li
        className={props.location.pathname === '/SignatureSearch' ? 'active' : ''}
      >
        <Link to="/SignatureSearch">
          Signature Search
        </Link>
      </li>
      <li
        className={props.location.pathname === '/MetadataSearch' ? 'active' : ''}
      >
        <Link to="/MetadataSearch">
          Metadata Search
        </Link>
      </li>
      <li
        className={props.location.pathname === '/Resources' ? 'active' : ''}
      >
        <Link to="/Resources">
          Resources
        </Link>
      </li>
      <li
        className={props.location.pathname === '/UploadCollection' ? 'active' : ''}
      >
        <Link to="/UploadCollection">
          Upload
        </Link>
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://petstore.swagger.io/?url=${meta_base_url}/openapi.json`}
        >
          API
        </a>
      </li>
    </ul>
  )
}


export default withRouter((props) => (
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
          &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; Signature Commons
        </Link>
        <Link
          to="/"
          className="brand-logo center hide-on-large-only"
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          &nbsp;&nbsp; <img src={`${process.env.PREFIX}/static/favicon.ico`} width={22} />&nbsp; Signature Commons
        </Link>
        <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
        <Nav id="nav-mobile" className="right hide-on-med-and-down" location={props.location} />
      </div>
      <Nav className="sidenav" id="mobile-menu" location={props.location} />
    </nav>
  </header>
))