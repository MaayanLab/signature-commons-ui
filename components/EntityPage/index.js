import React from 'react'
import ReactJson from 'react-json-view';
import { fetch_meta_post } from '../../util/fetch/meta';
import { fetch_data } from '../../util/fetch/data';
import { maybe_fix_obj } from '../../util/maybe_fix_obj'
import { ShowMeta } from '../../components/ShowMeta';

export default class EntityPage extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      duration: 0,
      duration_meta: 0,
      duration_data: 0,
      entity_name: "STAT3",
      status: null,
      controller: null,
      entity: null,
    }
  }

  async componentDidMount() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      const start = new Date()

      this.setState({
        status: 'Fetching entity...',
        controller,
      })
      let duration_meta = 0
      const { duration: duration_meta_1, response: entities } = await fetch_meta_post({
        endpoint: '/entities/find',
        body: {
          filter: {
            where: {
              'meta.Name': this.state.entity_name,
            },
            limit: 1,
          },
        },
        signal: controller.signal
      })
      duration_meta += duration_meta_1

      const entity = entities[0]

      this.setState({
        entity,
        status: 'Searching for signatures...',
      })

      let duration_data = 0
      const enriched_results = (await Promise.all([
        fetch_data('/enrich/overlap', {
          entities: [entity.id],
          signatures: [],
          database: 'enrichr_geneset',
          limit: 10,
        }, controller.signal),
        fetch_data('/enrich/overlap', {
          entities: [entity.id],
          signatures: [],
          database: 'creeds_geneset',
          limit: 10,
        }, controller.signal),
        fetch_data('/enrich/rank', {
          entities: [entity.id],
          signatures: [],
          database: 'lincs_clue',
          limit: 10,
        }, controller.signal),
        fetch_data('/enrich/rank', {
          entities: [entity.id],
          signatures: [],
          database: 'lincs_fwd',
          limit: 10,
        }, controller.signal),
      ])).reduce(
        (results, {duration: duration_data_n, response: result}) => {
          duration_data += duration_data_n
          return ({
            ...results,
            ...maybe_fix_obj(result.results),
          })
        }, {}
      )

      this.setState({
        duration_data: duration_data,
        status: 'Resolving signatures...',
      })

      const {duration: duration_meta_2, response: enriched_signatures_meta} = await fetch_meta_post({
        endpoint: '/signatures/find',
        body: {
          filter: {
            where: {
              id: {
                inq: Object.values(enriched_results).map((k) => k.id)
              }
            }
          }
        },
        signal: controller.signal
      })
      duration_meta += duration_meta_2

      this.setState({
        duration_meta,
      })

      const enriched_signatures = enriched_signatures_meta.reduce(
        (full, signature) => ([
          ...full,
          ...signature,
        ]), []
      )

      this.setState({
        signatures: enriched_signatures,
        duration: (Date.now() - start)/1000,
        status: '',
        controller: null,
      })
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + '',
          controller: null,
        })
      }
    }
  }

  render() {
    return (
      <div className="row" style={{backgroundColor: 'white'}}>
        Took {this.state.duration.toPrecision(3)} seconds total, {this.state.duration_meta.toPrecision(3)} on metadata, {this.state.duration_data.toPrecision(3)} on data
        {this.state.entity === null ? null : (
          <div className="col s12">
            <h3>{this.state.entity.meta.Name}</h3>
            <ShowMeta
              value={{
                '@id': this.state.entity.id,
                '@type': 'Entity',
                'meta': this.state.entity.meta
              }}
            />
          </div>
        )}
        {this.state.signatures === null ? null : (
          <div className="col s12">
            <h3>Signatures</h3>
            <ReactJson
              src={this.state.signatures}
              collapsed={2}
            />
          </div>
        )}
      </div>
    )
  }
}