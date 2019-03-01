import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import Admin from './pages/Admin';
import ArbitraryQuery from './pages/ArbitraryQuery';
import DBCK from './pages/DBCK';
import EntityPage from "./pages/EntityPage";
import Home from './pages/Home';
import MetadataSearch from './pages/MetadataSearch';
import Metatron from './pages/Metatron';
import Resources from './pages/Resources';
import SignatureSearch from './pages/SignatureSearch';
import Stats from './pages/Stats';
import TermQuery from './pages/TermQuery';
import Tests from './pages/Tests';
import Values from './pages/Values';

const App = () => (
  <Router>
    <div className="root">
      <Route path="/" component={Home} />
      <Route exact path="/admin" component={Admin} />
      <Route exact path="/arbitrary-query" component={ArbitraryQuery} />
      <Route exact path="/dbck" component={DBCK} />
      <Route exact path="/entity-page" component={EntityPage} />
      <Route exact path="/metadata-search" component={MetadataSearch} />
      <Route exact path="/metatron" component={Metatron} />
      <Route exact path="/resources" component={Resources} />
      <Route exact path="/signature-search" component={SignatureSearch} />
      <Route exact path="/stats" component={Stats} />
      <Route exact path="/term-query" component={TermQuery} />
      <Route exact path="/tests" component={Tests} />
      <Route exact path="/values" component={Values} />
    </div>
  </Router>
)

export default App;
