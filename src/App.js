import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Admin from './Admin';
import DBCK from './DBCK';
import Home from './Home';
import Query from './Query';
import Stats from './Stats';

const App = () => (
  <Router>
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/query">Query</Link>
        </li>
        <li>
          <Link to="/stats">Stats</Link>
        </li>
        <li>
          <Link to="/dbck">Database Check</Link>
        </li>
        <li>
          <Link to="/admin">Admin</Link>
        </li>
      </ul>

      <Route exact path="/" component={Home} />
      <Route exact path="/query" component={Query} />
      <Route exact path="/stats" component={Stats} />
      <Route exact path="/dbck" component={DBCK} />
      <Route exact path="/admin" component={Admin} />
    </div>
  </Router>
)

export default App;
