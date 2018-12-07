import React from "react";
import ReactJson from 'react-json-view';
import ReactLoading from 'react-loading';
import Swagger from 'swagger-client';
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { fetch_meta_post } from '../../util/fetch/meta';

export default class Query extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      term: 'breast cancer',
      term_results: {},
      enrichr_results: {},
      status: 'ready',
    }
    this.log = this.log.bind(this)
    this.submit = this.submit.bind(this)
    this.sendToEnrichr = this.sendToEnrichr.bind(this)
  }

  log(msg) {
    this.setState((prevState) => ({
      status: prevState.status + '\n' + msg
    }))
  }

  async sendToEnrichr() {
    try {
      const background_library = 'KEGG_2015'
      const gene_list = [
        'PHF14',
        'RBM3',
        'MSL1',
        'PHF21A',
        'ARL10',
        'INSR',
        'JADE2',
      ]
      this.log('Fetching API spec...')
      const client = await Swagger('https://raw.githubusercontent.com/MaayanLab/smartAPIs/master/enrichr_smartapi.yml')
      console.log(client)
      this.log('Uploading gene list to enrichr...')
      const resp = await client.apis.default.addList({}, {
        requestBody: {
          description: 'signature-commons-ui gene list',
          list: gene_list.join('\n'), // TODO: get gene_list
        },
        requestContentType: 'multipart/form-data',
        responseContentType: 'application/json',
      })
      this.log('Fetching enrichment results...')
      const results = await client.apis.default.enrich({
        userListId: resp.body.userListId,
        backgroundType: background_library, // TODO: background library, e.g. KEGG_2015
      })
      this.setState({
        enrichr_results: results.body,
      })
      this.log('ready')
    } catch(e) {
      this.log('Error: ' + e)
      this.setState({
        enrichr_results: {},
      })
    }
  }

  async submit() {
    try {
      this.setState({
        term_results: null,
      })

      this.log('fetching signatures...')
      const term_results = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            meta: {
              fullTextSearch: this.state.term,
            }
          },
          limit: 100,
        }
      })
      this.log('ready')
      this.setState({
        term_results,
      })
    } catch(e) {
      this.log('Error: ' + e)
      this.setState({
        term_results: this.state.term_results || {},
      })
    }
  }
  render() {
    return (
      <div className="root">
        <Header />
        <main>
          <fieldset>
            <legend>Term</legend>
            <input
              onChange={(e) => this.setState({term: e.target.value})}
              value={this.state.term}
              style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}
            />
            <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
              {this.state.term_results === null ? (
                <ReactLoading type="spokes"  color="#000" />
              ) : (
                <ReactJson
                  src={this.state.term_results}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>Process</legend>
            <button
              onClick={this.submit}
              style={{float: 'left', width: '49%', height: '150px'}}
            >
              Submit
            </button>
            <textarea
              readOnly
              value={this.state.status}
              style={{float: 'left', width: '49%', height: '150px'}}
            ></textarea>
          </fieldset>
          <fieldset>
            <legend>Send results to Enrichr</legend>
            <button
              onClick={this.sendToEnrichr}
              style={{float: 'left', width: '49%', height: '150px'}}
            >
              Send to Enrichr
            </button>
            <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
              {this.state.enrichr_results === null ? (
                <ReactLoading type="spokes"  color="#000" />
              ) : (
                <ReactJson
                  src={this.state.enrichr_results}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
        </main>
        <Footer />
      </div>
    );
  }
}
