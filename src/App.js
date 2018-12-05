import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Admin from './pages/Admin';
import ArbitraryQuery from './pages/ArbitraryQuery';
import Collections from './pages/Collections';
import DBCK from './pages/DBCK';
import Home from './pages/Home';
import SignatureSearch from './pages/SignatureSearch';
import Stats from './pages/Stats';
import TermQuery from './pages/TermQuery';
import Values from './pages/Values';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <div className="root">
      <Route exact path="/" component={Home} />
      <Route exact path="/signature-search" component={SignatureSearch} />
      <Route exact path="/collections" component={Collections} />
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
