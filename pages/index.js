import React from "react";
import dynamic from 'next/dynamic'

const Router = dynamic(async () => (await import('react-router-dom')).HashRouter, { ssr: false })
const Route = dynamic(async () => (await import('react-router-dom')).Route, { ssr: false })
const Admin = dynamic(() => import('../components/Admin'), { ssr: false })
const ArbitraryQuery = dynamic(() => import('../components/ArbitraryQuery'), { ssr: false })
const DBCK = dynamic(() => import('../components/DBCK'), { ssr: false })
const EntityPage = dynamic(() => import("../components/EntityPage"), { ssr: false })
const Home = dynamic(() => import('../components/Home'), { ssr: false })
const Stats = dynamic(() => import('../components/Stats'), { ssr: false })
const TermQuery = dynamic(() => import('../components/TermQuery'), { ssr: false })
const Tests = dynamic(() => import('../components/Tests'), { ssr: false })
const Values = dynamic(() => import('../components/Values'), { ssr: false })

const App = (props) => (
  <div className="root">
    <Router>
      <div className="root">
        <Route path="/" component={Home} />
        <Route exact path="/admin" component={Admin} />
        <Route exact path="/arbitrary-query" component={ArbitraryQuery} />
        <Route exact path="/dbck" component={DBCK} />
        <Route exact path="/entity-page" component={EntityPage} />
        <Route exact path="/stats" component={Stats} />
        <Route exact path="/term-query" component={TermQuery} />
        <Route exact path="/values" component={Values} />
        <Route exact path="/tests" component={Tests} />
      </div>
    </Router>
  </div>
)

export default App;