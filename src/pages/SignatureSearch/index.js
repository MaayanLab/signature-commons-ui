import { Set } from 'immutable';
import M from "materialize-css";
import React from "react";
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import { call } from '../../util/call';
import { Label } from '../../components/Label';

const example_geneset = 'SERPINA3 CFL1 FTH1 GJA1 HADHB LDHB MT1X RPL21 RPL34 RPL39 RPS15 RPS24 RPS27 RPS29 TMSB4XP8 TTR TUBA1B ANP32B DDAH1 HNRNPA1P10'.split(' ').join('\n')

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      geneset: '',
      time: 0,
      count: 0,
      key_count: {},
      value_count: {},
      matched_entities: [],
      mismatched_entities: [],
      status: null,
      controller: null,
    }

    this.submit = this.submit.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.removeFromCart = this.removeFromCart.bind(this)
    this.setGeneset = this.setGeneset.bind(this)
    this.setAndSubmit = this.setAndSubmit.bind(this)
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

      let entities = Set(this.state.geneset.split(/[ \t\n,;]+/))
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
        status: 'Searching...',
        matched_entities: entity_ids,
        mismatched_entities: entities,
      })

      const enriched = await fetch_data('/enrich/overlap', {
        entities: entity_ids,
        signatures: this.props.cart,
        database: 'enrichr',
      }, controller.signal)

      this.setState({
        status: 'Resolving signatures...',
        controller: controller,
        count: Object.keys(enriched.results).length,
      })

      const enriched_signatures_meta = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: Object.keys(enriched.results).map((k) => ({...enriched.results[k], id: k})).sort(
                (a, b) => {
                  if (a['p-value'] < b['p-value'])
                    return -1
                  else if (a['p-value'] > b['p-value'])
                    return 1
                  else
                    return 0
                }
              ).slice(1, 10).map((k) => k.id)
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
              ...enriched.results[signature.id],
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

      for(const signature of enriched_signatures)
        signature.library = library_dict[signature.library]

      this.setState({
        status: '',
        time: Date.now() - start,
        results: enriched_signatures,
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

  addToCart(id) {
    this.props.updateCart(
      this.props.cart.add(id)
    )
  }

  removeFromCart(id) {
    this.props.updateCart(
      this.props.cart.delete(id)
    )
  }

  setGeneset(e) {
    this.setState({search: e.target.value})
  }

  setAndSubmit(example) {
    this.setState(
      {
        geneset: example,
      },
      () => this.submit()
    )
  }
  

  render_signatures(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div className="col s12">
        <ul
          className="collapsible popout"
        >
          {results.map((signature) => (
            <li
              key={signature.id}
            >
              <div
                className="page-header"
                style={{
                  padding: 10,
                  display: 'flex',
                  flexDirection: "column",
                  backgroundColor: 'rgba(255,255,255,1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                  <Label
                    item={signature}
                    highlight={this.state.search}
                    visibility={1}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                  {this.props.cart.has(signature.id) ? (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn-small grey lighten-2 black-text"
                      onClick={call(this.removeFromCart, signature.id)}
                    >
                      <i className="material-icons left">remove_shopping_cart</i> Remove from Cart
                    </a>
                  ) : (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn-small grey lighten-2 black-text"
                      onClick={call(this.addtoCart, signature.id)}
                    >
                      <i className="material-icons left">add_shopping_cart</i> Add to Cart
                    </a>
                  )}

                  <a
                    href="#!"
                    className="waves-effect waves-light btn-small grey lighten-2 black-text"
                    onClick={call(this.props.download, signature.id)}
                  ><i className="material-icons prefix">file_download</i> Download</a>
                  <a
                    href="#!"
                    className="waves-effect waves-light btn-small grey lighten-2 black-text"
                  ><img
                    style={{
                      maxWidth: 48,
                      maxHeight: 24,
                      top: 5,
                    }}
                    alt="Signature Commons"
                    src="favicon.ico"
                  ></img> Signature Commons</a>
                  <a
                    href="#!"
                    className="waves-effect waves-light btn-small grey lighten-2 black-text"
                  ><img
                    style={{
                      maxWidth: 48,
                      maxHeight: 24,
                      top: 5,
                    }}
                    alt="Enrichr"
                    src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
                  ></img> Enrichr</a>
                  <a
                    href="#!"
                    className="waves-effect waves-light btn-small grey lighten-2 black-text"
                  ><img
                    style={{
                      maxWidth: 48,
                      maxHeight: 24,
                      top: 5,
                    }}
                    alt="GeneShot"
                    src="https://amp.pharm.mssm.edu/geneshot/images/targetArrow.png"
                  ></img> GeneShot</a>
                  <a
                    href="#!"
                    className="waves-effect waves-light btn-small grey lighten-2 black-text"
                  ><img
                    style={{
                      maxWidth: 48,
                      maxHeight: 24,
                      top: 5,
                    }}
                    alt="ARCHS4"
                    src="https://amp.pharm.mssm.edu/archs4/images/archs-icon.png?v=2"
                  ></img> ARCHS4
                  </a>
                  <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                  <a
                    href="#!"
                    className="collapsible-header"
                    style={{ border: 0 }}
                  >
                    <i className="material-icons">expand_more</i>
                  </a>
                </div>
              </div>
              <div
                className="collapsible-body"
              >
                <div 
                  style={{
                    height: '300px',
                    overflow: 'auto',
                  }}
                >
                  <ShowMeta
                    value={signature}
                    highlight={this.state.search}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
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
                    onChange={this.setGeneset}
                  ></textarea>
                </div>
              </div>
              <div className="col s2">&nbsp;</div>
              <div className="col s12">
                <div className="input-field">
                  <div
                    className="chip grey darken-2 white-text waves-effect waves-light"
                    onClick={call(this.setAndSubmit, example_geneset)}
                  >Example Gene Set</div>
                </div>
                <button className="btn grey lighten-2 black-text waves-effect waves-light blue" type="submit" name="action">Search
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
            ) : this.render_signatures(this.state.results)}
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
