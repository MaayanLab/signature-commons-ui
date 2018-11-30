import React from "react";
import ReactJson from 'react-json-view';
import ReactLoading from 'react-loading';
import { fetch_enrich } from '../fetch/enrich';
import { fetch_meta } from '../fetch/meta';

export default class Query extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      endpoint: 'libraries',
      query: '{}',
      results: [],
      status: 'ready',
    }
    this.submit = this.submit.bind(this)
  }

  async submit() {
    try {
      this.setState({
        results: null,
      })

      this.setState({
        status: this.state.status + '\nfetching ' + this.state.endpoint + '...',
      })
      const results = await fetch_meta(
        '/' + this.state.endpoint + '/key_count', 
        JSON.parse(this.state.query)
      )
      this.setState({
        status: this.state.status + '\nready',
        results: results,
      })
    } catch(e) {
      this.setState({
        status: this.state.status + '\nError: ' + e,
        results: this.state.results || [],
      })
    }
  }
  render() {
    return (
      <div>
        <select
          onChange={(e) => this.setState({endpoint: e.target.value})}
          value={this.state.endpoint}
          style={{float: 'left', width: '49%', height: '150px'}}
        >
          <option value="libraries">Library</option>
          <option value="signatures">Signature</option>
          <option value="entities">Entity</option>
        </select>
        <textarea
          onChange={(e) => this.setState({query: e.target.value})}
          value={this.state.query}
          style={{float: 'left', width: '49%', height: '150px'}}
        ></textarea>
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
        <div style={{float: 'left', width: '99%', height: '300px', overflow: 'auto'}}>
          {this.state.results === null ? (
            <ReactLoading type="spokes"  color="#000" />
          ) : (
            <ReactJson
              src={this.state.results}
              collapsed={2}
            />
          )}
        </div>
      </div>
    );
  }
}
