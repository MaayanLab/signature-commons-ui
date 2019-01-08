import { Map, Set } from 'immutable';
import M from "materialize-css";
import React from "react";
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import { BarGraph } from './BarGraph'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'
import { Label } from '../../components/Label';
import { call } from '../../util/call'

const example_geneset = 'SERPINA3 CFL1 FTH1 GJA1 HADHB LDHB MT1X RPL21 RPL34 RPL39 RPS15 RPS24 RPS27 RPS29 TMSB4XP8 TTR TUBA1B ANP32B DDAH1 HNRNPA1P10'.split(' ').join('\n')

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: Map(),
      geneset: '',
      time: 0,
      count: 0,
      key_count: {},
      value_count: {},
      matched_entities: [],
      mismatched_entities: [],
      status: null,
      controller: null,
      library: null,
    }

    this.submit = this.submit.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
    this.render_libraries = this.render_libraries.bind(this)
    this.set_library = this.set_library.bind(this)
  }

  componentDidMount() {
     M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Fetching entities...',
        controller: controller,
      })

      let entities = Set(this.state.geneset.split(/[ \n,;]+/))
      let entity_ids = Set()

      const start = Date.now()

      const entity_meta = await fetch_meta_post('/entities/find', {
        filter: {
          where: {
            'meta.Name': {
              inq: entities.toArray(),
            }
          },
          fields: [
            'id',
            'meta.Name',
          ]
        }
      }, controller.signal)
      
      for(const entity of entity_meta) {
        const matched_entities = Set.intersect(
          Set([entity.meta.Name]),
          entities,
        )

        entities = entities.subtract(matched_entities)
        entity_ids = entity_ids.add(entity.id)
      }

      this.setState({
        status: 'Enriching...',
        matched_entities: entity_ids,
        mismatched_entities: entities,
      })

      const enriched_results = (await Promise.all([
        fetch_data('/enrich/overlap', {
          entities: entity_ids,
          signatures: [],
          database: 'enrichr',
        }, controller.signal),
        fetch_data('/enrich/overlap', {
          entities: entity_ids,
          signatures: [],
          database: 'creeds',
        }, controller.signal),
        fetch_data('/enrich/rank', {
          entities: entity_ids,
          signatures: [],
          database: 'lincs',
        }, controller.signal),
        fetch_data('/enrich/rank', {
          entities: entity_ids,
          signatures: [],
          database: 'lincsfwd',
        }, controller.signal),
      ])).reduce(
        (results, result) => {
          return ({
            ...results,
            ...maybe_fix_obj(result.results),
          })
        }, {}
      )

      this.setState({
        status: 'Resolving signatures...',
        controller: controller,
        count: Object.keys(enriched_results).length,
      })

      const enriched_signatures_meta = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: Object.values(enriched_results).reduce(
                (K, k) => k['p-value'] < 0.05 ? [...K, k.id] : K, []
              )
            }
          }
        }
      }, controller.signal)

      const enriched_signatures = enriched_signatures_meta.reduce(
        (full, signature) => ([
          ...full,
          {
            ...signature,
            meta: {
              ...signature.meta,
              ...enriched_results[signature.id],
            },
          }
        ]), []
      ).sort(
        (a, b) => {
          if(a.meta['p-value'] < b.meta['p-value'])
            return -1
          else if(a.meta['p-value'] > b.meta['p-value'])
            return 1
          else
            return 0
        }
      )

      const library_ids = [...new Set(enriched_signatures.map((sig) => sig.library))]
      const libraries = await fetch_meta_post('/libraries/find', {
        filter: {
          where: {
            id: {
              inq: library_ids
            }
          },
        },
      }, controller.signal)
      const library_dict = libraries.reduce((L, l) => ({...L, [l.id]: l}), {})

      const grouped_signatures = enriched_signatures.reduce(
        (groups, sig) => {
          if(groups[sig.library] === undefined) {
            groups[sig.library] = {
              library: library_dict[sig.library],
              signatures: []
            }
          }
          groups[sig.library].signatures.push({...sig, library: groups[sig.library].library})
          return groups
        }, {}
      )

      this.setState({
        results: grouped_signatures,
        status: '',
        time: Date.now() - start,
      })
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + ''
        })
      }
    }
  }

  async fetch_values(key) {
    this.setState({
      value_count: {},
    })
    const where = this.build_where()
    const value_count = await fetch_meta('/signatures/value_count', {
      filter: {
        where,
        fields: [
          key,
        ]
      },
      depth: 2,
    })
    this.setState({
      value_count,
    })
  }

  set_library(library) {
    this.setState({
      library
    })
  }

  render_libraries(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div className="col s12">
        <div className="row">
          {Object.keys(results).map((key) => (
            <div key={key} className="card col l6 s12">
              <div className="card-content">
                <a
                  onClick={call(this.set_library, results[key].library)}
                  href="#!"
                >
                  <div className="card-title" style={{ whiteSpace: 'nowrap' }}>
                    <Label
                      item={results[key].library}
                      highlight={this.state.search}
                      visibility={1}
                    />
                  </div>
                </a>
              </div>
              <div className="card-content">
                <BarGraph
                  data={results[key].signatures}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  render() {
    return (
      <main id={this.props.id}>
        <div className="row">
          <div className="col s12 center">
            <form
              action="javascript:void(0);"
              onSubmit={this.submit}
            >
              <div className="col s2">&nbsp;</div>
              <div className="col s8">
                <div className="input-field">
                  <textarea
                    id="geneset"
                    placeholder="Genes that are up-regulated in signature or overlap with gene-set."
                    style={{
                      height: 200,
                      overflow: 'auto',
                    }}
                    value={this.state.geneset}
                    onChange={(e) => this.setState({geneset: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="col s2">&nbsp;</div>
              <div className="col s12">
                <div className="input-field">
                  <div
                    className="chip waves-effect waves-light"
                    onClick={() => this.setState({
                      geneset: example_geneset,
                    }, () => this.submit())}
                  >Example Gene Set</div>
                </div>
                <button className="btn waves-effect waves-light blue" type="submit" name="action">Search
                  <i className="material-icons right">send</i>
                </button>
              </div>
            </form>
          </div>

          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                About {this.state.count} results ({this.state.time/1000} seconds)
              </span>
            )}
          </div>
          {/*
          {this.state.mismatched_entities.length <= 0 ? null : (
            <div className="col s12 center">
              The following entities could not be identified!
              <textarea
                readOnly
                value={this.state.mismatched_entities.join(' ')}
              ></textarea>
            </div>
          )}
          {this.state.matched_entities.length <= 0 ? null : (
            <div className="col s12 center">
              The following entities were identified
              <textarea
                readOnly
                value={this.state.matched_entities.join(' ')}
              ></textarea>
            </div>
          )}
          */}
          <div className="col s12">
            {this.state.status !== '' ? (
              <div className="center">
                {this.state.status}
              </div>
            ) : this.render_libraries(this.state.results)}
          </div>
          {this.state.results.length < 10 || this.state.status !== '' ? null : (
            <div className="col s12 center">
              <ul className="pagination">
                <li className="disabled"><a href="#!"><i className="material-icons">chevron_left</i></a></li>
                <li className="active blue"><a href="#!">1</a></li>
                <li className="waves-effect"><a href="#!">2</a></li>
                <li className="waves-effect"><a href="#!">3</a></li>
                <li className="waves-effect"><a href="#!"><i className="material-icons">chevron_right</i></a></li>
              </ul>
            </div>
          )}
        </div>
      </main>
    );
  }
}
