import M from "materialize-css";
import React from "react";
import { Highlight } from '../../components/Highlight';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";

const count = 'half a million'

const buildTitle = (sig, highlight) => {
  const buildLabels = (labels) => (
    <span>
      {Object.keys(labels).map((key) => labels[key] === undefined || ((labels[key]+'') === '-666') ? null : (
        <Highlight
          key={key}
          text={key + ': ' + labels[key]+''}
          highlight={highlight}
          props={{
            className: "chip"
          }}
        />
      ))}
    </span>
  )

  if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/draft-1.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="Enrichr"
            src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
          />
          Enrichr
        </div>
        {buildLabels({
          'Resource': sig.meta.Resource,
          'Assay': sig.meta.Assay,
          'Organism': sig.meta.Organism,
          'Description': sig.meta['Original String'],
        })}
      </div>
    )
  }
  else if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/clue-io.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="ConnectivityMap"
            src="http://amp.pharm.mssm.edu/enrichmentapi/images/clue.png"
          />
          ConnectivityMap
        </div>
        {buildLabels({
          'Assay': 'L1000',
          'Batch': sig.meta.pert_mfc_id,
          'Cell-line': sig.meta.cell_id,
          'Time point': sig.meta.pert_time + ' ' + sig.meta.pert_time_unit,
          'Perturbation': sig.meta.pert_desc,
          'Concentration': sig.meta.pert_dose,
        })}
      </div>
    )
  } else if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/creeds.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="CREEDS"
            src="http://amp.pharm.mssm.edu/CREEDS/img/creeds.png"
          />
          CREEDS
        </div>
        {buildLabels({
          'Assay': 'Microarray',
          'Drug': sig.meta.drug_name,
          'DrugBank': sig.meta.drugbank_id,
          'Organism': sig.meta.organism,
          'GEO Accession': sig.meta.geo_id,
          'CREEDS ID': sig.meta.id,
        })}
      </div>
    )
  }
}

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      time: 0,
      count: 0,
      key_count: {},
      value_count: {},
      status: null,
      controller: null,
    }

    this.submit = this.submit.bind(this)
    this.build_where = this.build_where.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
  }

  componentDidMount() {
    M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  build_where() {
    if (this.state.search.indexOf(':') !== -1) {
      const [key, ...value] = this.state.search.split(':')
      return {
        ['meta.' + key]: {
          ilike: '%' + value.join(':') + '%'
        }
      }
    } else {
      return {
        meta: {
          fullTextSearch: this.state.search
        }
      }
    }
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Searching...',
        controller: controller,
      })

      const where = this.build_where()

      const start = Date.now()
      const results = await fetch_meta_post('/signatures/find', {
        filter: {
          where,
          limit: 20,
        },
      }, controller.signal)

      this.setState({
        results,
        status: '',
        time: Date.now() - start,
      })

      const key_count = await fetch_meta('/signatures/key_count', {
        filter: {
          where,
        },
      }, controller.signal)

      this.setState({
        key_count,
        count: key_count['$validator'],
        controller: null,
      }, () => M.AutoInit())
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
          {results.map((signature, ind) => (
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
                  {buildTitle(signature, this.state.search)}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: "row",
                }}>
                  {this.props.cart.has(signature.id) ? (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      onClick={() => {
                        this.props.updateCart(
                          this.props.cart.delete(signature.id)
                        )
                      }}
                    >
                      <i className="material-icons left">remove_shopping_cart</i> Remove from Cart
                    </a>
                  ) : (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      onClick={() => {
                        this.props.updateCart(
                          this.props.cart.add(signature.id)
                        )
                      }}
                    >
                      <i className="material-icons left">add_shopping_cart</i> Add to Cart
                    </a>
                  )}

                  <a
                    href="#!"
                    className="waves-effect waves-light btn"
                    onClick={() => this.props.download(signature.id)}
                  ><i className="material-icons prefix">file_download</i> Download</a>
                  <a
                    href="#!"
                    className="waves-effect waves-light btn"
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
                    className="waves-effect waves-light btn"
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
                    className="waves-effect waves-light btn"
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
                    className="waves-effect waves-light btn"
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
                    value={{ID: signature.id, ...signature.meta}}
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
        <ul id="slide-out" className="sidenav">
          {Object.keys(this.state.key_count).filter((key) => !key.startsWith('$')).map((key) => (
            <li key={key} className="no-padding">
              <ul className="collapsible collapsible-accordion">
                <li>
                  <a
                    href="#!"
                    className="collapsible-header"
                  >
                    {key} ({this.state.key_count[key]})
                  </a>
                  <div className="collapsible-body">
                    {this.state.value_count[key] === undefined ? null : (
                      <ul>
                        {Object.keys(this.state.value_count[key]).map((k) => (
                          <li key={key + '.' + k}>
                            <a href="#!">
                              <label>
                                <input type="checkbox" />
                                <span>
                                  {k} ({this.state.value_count[key][k]})
                                </span>
                              </label>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              </ul>
            </li>
          ))}
        </ul>

        <div className="row">
          <div className="col s12 center">
            <form action="javascript:void(0);" onSubmit={this.submit}>
              <div className="input-field">
                <i className="material-icons prefix">search</i>
                <input
                  id="searchBox"
                  type="text"
                  onChange={(e) => this.setState({search: e.target.value})}
                  value={this.state.search}
                  className="active"
                  placeholder={'Search over '+count+' signatures'}
                  style={{
                    fontWeight: 500,
                    color: 'rgba(0, 0, 0, 0.54)',
                    borderRadius: '2px',
                    border: 0,
                    height: '36px',
                    width: '350px',
                    padding: '8px 8px 8px 60px',
                    background: '#f7f7f7',
                  }}
                />
                <span>&nbsp;&nbsp;</span>
                <button className="btn waves-effect waves-light" type="submit" name="action">Search
                  <i className="material-icons right">send</i>
                </button>
              </div>
              {['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'].map((example) => (
                <div
                  key={example}
                  className="chip waves-effect waves-light"
                  onClick={() => this.setState({
                    search: example,
                  }, () => this.submit())}
                >{example}</div>
              ))}
            </form>
          </div>
          <div className="col s2"></div>
          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                About {this.state.count} results ({this.state.time/1000} seconds)
              </span>
            )}
          </div>
          <div className="col s12">
            {this.state.status !== '' ? (
              <div className="center">
                {this.state.status}
              </div>
            ) : this.render_signatures(this.state.results)}
          </div>
          {this.state.results.length <= 20 || this.state.status !== '' ? null : (
            <div className="col s12 center">
              <ul className="pagination">
                <li className="disabled"><a href="#!"><i className="material-icons">chevron_left</i></a></li>
                <li className="active teal"><a href="#!">1</a></li>
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
