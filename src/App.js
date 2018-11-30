import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Admin from './Admin';
import DBCK from './DBCK';
import Home from './Home';
import TermQuery from './TermQuery';
import ArbitraryQuery from './ArbitraryQuery';
import Stats from './Stats';
import Values from './Values';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <div className="root">
      {/* <ul>
        <li>
          <Link to="">Home</Link>
        </li>
        <li>
          <Link to="/term-query">Term Query</Link>
        </li>
        <li>
          <Link to="/arbitrary-query">Arbitrary Query</Link>
        </li>
        <li>
          <Link to="/stats">Stats</Link>
        </li>
        <li>
          <Link to="/values">Values</Link>
        </li>
        <li>
          <Link to="/dbck">Database Check</Link>
        </li>
        <li>
          <Link to="/admin">Admin</Link>
        </li>
      </ul> */}

      <Route exact path="/" component={Home} />
      <Route exact path="/term-query" component={TermQuery} />
      <Route exact path="/arbitrary-query" component={ArbitraryQuery} />
      <Route exact path="/stats" component={Stats} />
      <Route exact path="/values" component={Values} />
      <Route exact path="/dbck" component={DBCK} />
      <Route exact path="/admin" component={Admin} />
    </div>
  </Router>
)

export default App;
