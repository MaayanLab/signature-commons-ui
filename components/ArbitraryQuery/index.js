import React from 'react'
import ReactJson from 'react-json-view'
import ReactLoading from 'react-loading'
import { fetch_data } from '../../util/fetch/data'
import { fetch_meta_post } from '../../util/fetch/meta'

export default class ArbitraryQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      entities: '{"where": {"meta.Name": {"inq": ["MDM2", "MAPT", "CCND1", "JAK2", "BIRC5", "FAS", "NOTCH1", "MAPK14", "MAPK3", "ATM", "NFE2L2", "ITGB1", "SIRT1", "LRRK2", "IGF1R", "GSK3B", "RELA", "CDKN1B", "NR3C1", "BAX", "CASP3", "JUN", "SP1", "RAC1", "CAV1", "RB1", "PARP1", "EZh3", "RHOA", "PGR", "SRC", "MAPK8", "PTK2"] } }, "limit": 33 }',
      entities_results: '{}',
      signatures: '{"where": {"id": {"inq": ["0592d5be-c1a1-11e8-91f5-0242ac170004", "0592f610-c1a1-11e8-9d19-0242ac170004"] } }, "limit": 2 }',
      signatures_results: '{}',
      enrich_results: '{}',
      results: '[]',
      status: 'ready',
      meta_duration: 0,
      data_duration: 0,
    }
  }

  submit = async () => {
    try {
      this.setState({
        entities_results: null,
        signatures_results: null,
        enrich_results: null,
        results: null,
      })

      this.setState({
        status: this.state.status + '\nfetching entities...',
      })
      const { duration: duration_meta_1, response: entities_meta } = await fetch_meta_post({
        endpoint: '/entities/find',
        body: {
          filter: JSON.parse(this.state.entities),
        },
      })
      this.setState({
        status: this.state.status + '\nfetching signatures...',
        entities_results: entities_meta,
      })
      const { duration: duration_meta_2, response: signatures_meta } = await fetch_meta_post({
        endpoint: '/signatures/find',
        body: {
          filter: JSON.parse(this.state.signatures),
        },
      })
      this.setState({
        status: this.state.status + '\nenriching signatures...',
        signatures_results: signatures_meta,
      })
      const { duration: duration_data_1, response: enriched } = await fetch_data({
        endpoint: '/enrich/overlap',
        body: {
          entities: entities_meta.map((entity) => entity.id),
          signatures: signatures_meta.map((signature) => signature.id),
        },
      })
      this.setState({
        status: this.state.status + '\nfetching enriched signatures...',
        enrich_results: enriched,
      })
      const { duration: duration_meta_3, response: enriched_signatures_meta } = await fetch_meta_post({
        endpoint: '/signatures/find',
        body: {
          filter: {
            where: {
              id: {
                inq: Object.keys(enriched.results),
              },
            },
          },
        },
      })
      const enriched_signatures = enriched_signatures_meta.reduce((full, signature) => ([
        ...full,
        {
          ...signature,
          ...enriched.results[signature.id],
        },
      ]))
      this.setState({
        status: this.state.status + '\nready',
        results: enriched_signatures,
        meta_duration: duration_meta_1 + duration_meta_2 + duration_meta_3,
        data_duration: duration_data_1,
      })
    } catch (e) {
      this.setState({
        status: this.state.status + '\nError: ' + e,
        entities_results: this.state.entities_results || {},
        signatures_results: this.state.signatures_results || {},
        enrich_results: this.state.enrich_results || {},
        results: this.state.results || [],
      })
    }
  }
  render = () => {
    return (
      <div className="root">
        <main>
          <fieldset>
            <legend>Entities</legend>
            <textarea
              onChange={(e) => this.setState({ entities: e.target.value })}
              value={this.state.entities}
              style={{ float: 'left', width: '49%', height: '150px' }}
            ></textarea>
            <div style={{ float: 'left', width: '49%', height: '150px', overflow: 'auto' }}>
              {this.state.entities_results === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={this.state.entities_results}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>Signatures</legend>
            <textarea
              onChange={(e) => this.setState({ signatures: e.target.value })}
              value={this.state.signatures}
              style={{ float: 'left', width: '49%', height: '150px' }}
            ></textarea>
            <div style={{ float: 'left', width: '49%', height: '150px', overflow: 'auto' }}>
              {this.state.signatures_results === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={this.state.signatures_results}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>Process</legend>
            <button
              onClick={this.submit}
              style={{ float: 'left', width: '49%', height: '150px' }}
            >
              Submit
            </button>
            <textarea
              readOnly
              value={this.state.status}
              style={{ float: 'left', width: '49%', height: '150px' }}
            ></textarea>
          </fieldset>
          <fieldset>
            <legend>Results</legend>
            <div style={{ float: 'left', width: '49%', height: '150px', overflow: 'auto' }}>
              {this.state.enrich_results === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={this.state.enrich_results}
                  collapsed={2}
                />
              )}
            </div>
            <div style={{ float: 'left', width: '49%', height: '150px', overflow: 'auto' }}>
              {this.state.results === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={this.state.results}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
        </main>
      </div>
    )
  }
}
