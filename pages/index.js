import React from 'react'
import dynamic from 'next/dynamic'
import CircularProgress from '@material-ui/core/CircularProgress'

import { fetch_meta_post } from '../util/fetch/meta'
import { UIValues } from '../util/ui_values'
import { initializeSigcom } from '../util/redux/actions'
import { connect } from 'react-redux'

const Router = dynamic(async () => (await import('react-router-dom')).HashRouter, { ssr: false })
const Route = dynamic(async () => (await import('react-router-dom')).Route, { ssr: false })
const ArbitraryQuery = dynamic(() => import('../components/ArbitraryQuery'), { ssr: false })
const DBCK = dynamic(() => import('../components/DBCK'), { ssr: false })
const EntityPage = dynamic(() => import('../components/EntityPage'), { ssr: false })
const Home = dynamic(() => import('../components/Home'), { ssr: false })
const Stats = dynamic(() => import('../components/Stats'), { ssr: false })
const TermQuery = dynamic(() => import('../components/TermQuery'), { ssr: false })
const Tests = dynamic(() => import('../components/Tests'), { ssr: false })
const Values = dynamic(() => import('../components/Values'), { ssr: false })


function mapDispatchToProps(dispatch) {
  return {
    initializeSigcom: (serverSideProps) => dispatch(initializeSigcom(serverSideProps)),
  }
}


const mapStateToProps = (state) => {
  return {
    initialized: state.initialized,
  }
}

export async function get_ui_values() {
  const { response: ui_val } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json',
          'meta.landing': true,
        },
      },
    },
  })
  const values = ui_val.length > 0 ? ui_val[0].meta.content : {}
  const ui_values = UIValues['landing'](values)
  return { ui_values }
}

class App extends React.Component {
  static async getInitialProps() {
    
  }

  async componentDidMount() {
    this.props.initializeSigcom()
  }

  render() {
    if (!this.props.initialized) {
      return  <div style={{ textAlign: 'center', marginTop: 100 }}>
                <CircularProgress />
              </div>
    }
    return (
      <div className="root">
        <Router>
          <div className="root">
            <Route path="/" render={(router_props) => <Home {...router_props}/>} />
            {/* <Route exact path="/arbitrary-query" component={ArbitraryQuery} />
            <Route exact path="/dbck" component={DBCK} />
            <Route exact path="/entity-page" component={EntityPage} />
            <Route exact path="/stats" component={Stats} />
            <Route exact path="/term-query" component={TermQuery} />
            <Route exact path="/values" component={Values} />
            <Route exact path="/tests" component={Tests} /> */}
          </div>
        </Router>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
