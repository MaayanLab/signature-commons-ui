import React from "react";

export class Footer extends React.Component {
  render() {
    return (
    <footer className="page-footer teal">
      <div className="container">
        <div class="row">
          <div class="col l4 m6 s12">
            <ul>
              <li><a class="grey-text text-lighten-3" href="stats">Database Statistics</a></li>
            </ul>
          </div>
          <div class="col l4 m6 s12">
            <ul>
              <li><a class="grey-text text-lighten-3" href="/DBCK">Database Check</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
    )
  }
}

