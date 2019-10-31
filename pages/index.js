import React from 'react'
import dynamic from 'next/dynamic'
import CircularProgress from '@material-ui/core/CircularProgress';

import { fetch_meta, fetch_meta_post } from '../util/fetch/meta'
import { get_schemas } from '../util/helper/fetch_methods.js'
import { get_signature_counts_per_resources } from '../util/helper/resources.js'
import { UIValues } from '../util/ui_values'
import { initializeSigcom } from '../util/redux/actions'
import { connect } from "react-redux";
import { get_counts,
  get_metacounts,
  get_pie_stats,
  get_signature_keys,
  get_barcounts,
  get_histograms,
  get_barscores,
  get_resource_signature_counts
  } from '../util/helper/server_side.js'

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
    initializeSigcom: serverSideProps => dispatch(initializeSigcom(serverSideProps)),
  };
}


const mapStateToProps = state => {
  return {
    initialized: state.initialized
  }
};

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
  console.log(ui_val)
  const ui_values = UIValues['landing'](values)
  return { ui_values }
}

class App extends React.Component {
  static async getInitialProps() {
    const { ui_values } = await get_ui_values()
    // Check if it has library_name and resource_from_library
    const schemas = await get_schemas(ui_values.ui_schema)
    // const { resource_signatures, resources, resources_id, library_resource } = await get_signature_counts_per_resources(ui_values, schemas)
    const { table_counts, ui_values: ui_val } = await get_counts(ui_values)
    const { meta_counts } = await get_metacounts(ui_val)
    const { pie_fields_and_stats } = await get_pie_stats(ui_val)
    // const signature_keys = await get_signature_keys()
    const { barcounts } = await get_barcounts(ui_val)
    const { histograms } = await get_histograms(ui_val)
    const { barscores } = await get_barscores(ui_val)
    const { resource_signature_counts } = await get_resource_signature_counts()
    const serverSideProps = {
      table_counts,
      meta_counts,//: {},
      // resource_signatures,
      pie_fields_and_stats,//: {},
      barcounts,
      histograms,
      barscores,
      // signature_keys,
      // resources,
      // resources_id,
      // library_resource,
      ui_values,//: ui_val,
      schemas,
      resource_signature_counts,
    }
    return { serverSideProps }
  }

  async componentDidMount(){
    this.props.initializeSigcom(this.props.serverSideProps)
  }

  render() {
    if (!this.props.initialized){
      return <CircularProgress />
    }
    return (
      <div className="root">
        <Router>
          <div className="root">
            <Route path="/" render={(router_props) => <Home {...router_props}/>} />
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)