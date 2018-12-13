import React from "react";
import M from "materialize-css";

export class Header extends React.Component {
  componentDidMount() {
    M.AutoInit();
  }

  render() {
    return (
      <header>
        <nav className="nav-extended">
          <div className="nav-wrapper teal">
            <a
              href="/"
              className="brand-logo center"
              style={{
                whiteSpace: 'nowrap',
              }}
            >Signature Commons Metadata Search</a>
            <a href="#!" data-target="slide-out" className="sidenav-trigger show-on-large"><i className="material-icons">menu</i></a>
          </div>
          <div className="nav-content teal">
            <ul className="tabs tabs-transparent">
              <li className="tab">
                <a href="#MetadataSearch">
                  Metadata Search
                </a>
              </li>
              <li className="tab">
                <a href="#SignatureSearch">
                  Signature Search
                </a>
              </li>
              <li className="tab">
                <a href="#Collections">
                  Collections of Signatures
                </a>
              </li>
              <li className="tab">
                <a href="#UploadCollection">
                  Upload a Collection
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}
