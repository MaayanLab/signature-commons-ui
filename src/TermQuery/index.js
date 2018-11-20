import React from "react";
import ReactJson from 'react-json-view';
import ReactLoading from 'react-loading';
import { fetch_meta } from '../fetch/meta';
import Swagger from 'swagger-client'

export default class Query extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      term: 'breast cancer',
      term_results: '{}',
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
      const gene_list = []
      this.log('Fetching API spec...')
      const client = await Swagger('https://github.com/MaayanLab/smartAPIs/blob/master/enrichr_smartapi.yml')
      this.log('Uploading gene list to enrichr...')
      const resp = await client.apis.addList({
        list: gene_list, // TODO: get gene_list
      })
      this.log('Fetching enrichment results...')
      const results = client.apis.enrich({
        userListId: resp.userListId,
        backgroundType: background_library, // TODO: background library, e.g. KEGG_2015
      })
      this.log('ready')
    } catch(e) {
      this.log('Error: ' + e)
    }
  }

  async submit() {
    try {
      this.setState({
        term_results: null,
      })

      this.log('fetching signatures...')
      const term_results = await fetch_meta('/signatures', {
        filter: JSON.stringify({
          where: {
            meta: {
              fullTextSearch: this.state.term,
            }
          },
          limit: 100,
        })
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
      <div>
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
            readonly
            value={this.state.status}
            style={{float: 'left', width: '49%', height: '150px'}}
          ></textarea>
        </fieldset>
        <fieldset>
          <legend>Send results to...</legend>
          <button
            onClick={this.sendToEnrichr}
            style={{float: 'left', width: '49%', height: '150px'}}
          >
            Send to Enrichr
          </button>
        </fieldset>
      </div>
    );
  }
}
