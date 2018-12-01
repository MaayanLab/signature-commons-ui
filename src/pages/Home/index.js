import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { ShowMeta } from '../../components/ShowMeta';
import { strToRGB } from '../../util/colors';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta } from "../../util/fetch/meta";

const count = 'half a million'

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
    M.updateTextFields();
  }

  build_where() {
    if (this.state.search.indexOf(':') !== -1) {
      const [key, ...value] = this.state.search.split(':')
      return {
        ['meta.' + key]: value.join(':')
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
          limit: 9,
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
                {['MCF10A', 'Cell Line.Name:MCF-7 cell', 'L1000', 'Assay:RNA-seq', 'Imatinib',].map((example) => (
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
                  this.state.results.map((signature) => (
                    <div
                      key={signature.id}
                      className="col s12 m6 l4"
                    >
                      <div className="card">
                        <div className="card-content">
                          <span className="card-title" style={{
                            display: 'flex',
                            flexDirection: "row",
                          }}>
                            {signature.id.split('-').map((part) => (
                              <div style={{
                                height: '20px',
                                flex: '1 0 auto',
                                backgroundColor: strToRGB(part),
                              }}>
                                &nbsp;
                              </div>
                            ))}
                            <div style={{
                              flex: '3 0 auto',
                            }}>
                              &nbsp;
                            </div>
                          </span>
                          <div style={{
                            height: '200px',
                            overflow: 'auto',
                          }}>
                            <ShowMeta
                              value={{ID: signature.id, ...signature.meta}}
                            />
                          </div>
                        </div>
                        <div className="card-action" style={{
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
                              maxWidth: 24,
                              maxHeight: 24,
                            }}
                            src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
                          ></img></a>
                          <a href="#"><img
                            style={{
                              maxWidth: 24,
                              maxHeight: 24,
                            }}
                            src="https://amp.pharm.mssm.edu/geneshot/images/targetArrow.png"
                          ></img></a>
                          <a href="#"><img
                            style={{
                              maxWidth: 24,
                              maxHeight: 24,
                            }}
                            src="https://amp.pharm.mssm.edu/archs4/images/archs-icon.png?v=2"
                          ></img></a>
                        </div>
                      </div>
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
