import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { ShowMeta } from '../../components/ShowMeta';
import { range } from '../../util/range';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta } from "../../util/fetch/meta";

const count = 'half a million'
const n_rows = 1

const buildTitle = (sig) => {
  const buildLabels = (labels) => (
    <span>
      {Object.keys(labels).map((key) => labels[key] === undefined || labels[key] == '-666' ? null : (
        <div className="chip">{key}: {labels[key]}</div>
      ))}
    </span>
  )
  
  if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/draft-1.json') {
    return (
      <div>
        <div class="chip">
          <img
            style={{
              maxWidth: 24,
              maxHeight: 24,
            }}
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
        <div class="chip">
          <img
            style={{
              maxWidth: 24,
              maxHeight: 24,
            }}
            src = "http://amp.pharm.mssm.edu/enrichmentapi/images/clue.png"
          />
          ClueIO
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
        <div class="chip">
          <img
            style={{
              maxWidth: 24,
              maxHeight: 24,
            }}
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
      const results = await fetch_meta('/signatures', {
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

  async download(id) {
    const signature_data = await fetch_data(id)
    const signature_metadata = await fetch_meta('/signatures', {
      filter: {
        where: {
          id: id,
        }
      }
    })
    const entity_metadata = await fetch_meta('/entites', {
      filter: {
        where: {
          id: {
            inq: signature_data.entities,
          }
        }
      }
    })
    const data = {
      signature: signature_metadata,
      entites: entity_metadata,
      values: signature_data.values,
    }
    fileDownload(data, 'data.json');
  }

  render() {
    return (
      <div className="root">
        <Header />

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

        <main>
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
              ) : (
                this.state.results.length <= 0 ? (
                  <div className="center">
                    {this.state.status === null ? null : 'No results.'}
                  </div>
                ) : (
                  range(n_rows).map((n) => (
                    <div
                      key={n}
                      className={"col s" + (12/n_rows)}
                    >
                      <ul
                        class="collapsible popout"
                      >
                        {this.state.results.filter((_, ind) => (ind % n_rows) === n).map((signature, ind) => (
                          <li
                            key={signature.id}
                          >
                            <div
                              className="collapsible-header"
                              style={{
                                display: 'flex',
                                flexDirection: "row",
                              }}>
                                {buildTitle(signature)}
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
                                />
                              </div>
                              <div style={{
                                display: 'flex',
                                flexDirection: "row",
                              }}>
                                <a href="#"><i className="material-icons prefix">shopping_cart</i></a>
                                <a
                                  href="#"
                                  onClick={() => this.fileDownload(signature.id)}
                                ><i className="material-icons prefix">file_download</i></a>
                                <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                                <i className="material-icons prefix" style={{ marginRight: '24px' }}>send</i>
                                <a href="#"><img
                                  style={{
                                    maxWidth: 48,
                                    maxHeight: 24,
                                  }}
                                  src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
                                ></img></a>
                                <a href="#"><img
                                  style={{
                                    maxWidth: 48,
                                    maxHeight: 24,
                                  }}
                                  src="https://amp.pharm.mssm.edu/geneshot/images/targetArrow.png"
                                ></img></a>
                                <a href="#"><img
                                  style={{
                                    maxWidth: 48,
                                    maxHeight: 24,
                                  }}
                                  src="https://amp.pharm.mssm.edu/archs4/images/archs-icon.png?v=2"
                                ></img></a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )
              )}
            </div>
            {this.state.results.length <= 0 || this.state.status !== '' ? null : (
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
        <Footer />
      </div>
    );
  }
}
