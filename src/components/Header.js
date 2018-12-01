import React from "react";
import M from "materialize-css";

export class Header extends React.Component {
  componentDidMount() {
    M.AutoInit();
  }

  render() {
    return (
      <header>
        <nav>
          <div className="nav-wrapper teal">
            <a href="/" className="brand-logo">Signature Commons Metadata Search</a>
            <a href="#" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>
          </div>
        </nav>
      </header>
    )
  }
}
