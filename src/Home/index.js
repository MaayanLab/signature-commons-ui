import React from "react";
import M from "materialize-css";
import { fetch_meta } from "../fetch/meta";

const count = '1 million'

function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
     hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
} 

function intToRGB(i){
  var c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

function range(n) {
  function *_range(n) {
    for(var i = 0; i < n; i++) {
      yield n
    }
  }
  return [..._range(n)]
}

const ShowMeta = (props) => {
  if(typeof(props.value) === 'string' || typeof(props.value) === 'number' || typeof(props.value) === 'boolean') {
    return (
      <span>{props.value + ''}</span>
    )
  } else if(Array.isArray(props.value)) {
    return (
      <ul>
        {props.value.map((value, ind) => (
          <li key={ind}>
            <ShowMeta value={value} />
          </li>
        ))}
      </ul>
    )
  } else if(typeof props.value === 'object') {
    return (
      <ul>
        {Object.keys(props.value).filter((key) => !key.startsWith('$')).map((key, ind) => (
          <li key={key}>
            <b>{key}:</b>
            <div style={{ marginLeft: '5px' }}>
              <ShowMeta value={props.value[key]} />
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    console.error(props.value)
    return null
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      time: 0,
      count: 0,
      key_count: {},
      status: '',
      controller: null,
    }

    this.submit = this.submit.bind(this)
  }

  componentDidMount() {
    M.AutoInit();
  }

  componentDidUpdate() {
    M.updateTextFields();
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'searching...',
        controller: controller,
      })

      let where
      if(this.state.search.indexOf(':') !== -1) {
        const [key, ...value] = this.state.search.split(':')
        where = {
          ['meta.' + key]: value.join(':')
        }
      } else {
        where = {
          meta: {
            fullTextSearch: this.state.search
          }
        }
      }

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

  render() {
    return (
      <div className="root">
        <header>
          <nav>
            <div className="nav-wrapper teal">
              <a href="#!" className="brand-logo">Signature Commons UI</a>
              <a href="#" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>
            </div>
          </nav>
        </header>

        <ul id="slide-out" className="sidenav sidenav-fixed">
          {Object.keys(this.state.key_count).filter((key) => !key.startsWith('$')).map((key) => (
            <li key={key} className="no-padding">
              <ul className="collapsible collapsible-accordion">
                <li>
                  <a href="#!" className="collapsible-header">
                    <label>
                      <input type="checkbox" />
                      <span>
                        {key} ({this.state.key_count[key]})
                      </span>
                    </label>
                  </a>
                  <div className="collapsible-body">
                    <ul>
                      <li>
                        <a href="#!">
                          <label>
                            <input type="checkbox" />
                            <span>
                              todo (0)
                            </span>
                          </label>
                        </a>
                      </li>
                    </ul>
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
                      width: '250px',
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
            <div className="col s12">
              <span className="grey-text">
                About {this.state.count} results ({this.state.time/1000} seconds)
              </span>
            </div>
            <div className="col s12">
              {this.state.status !== '' ? this.state.status : (
                this.state.results.length <= 0 ? (
                  <span>
                    No results.
                  </span>
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
                                backgroundColor: '#' + intToRGB(hashCode(part)),
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
                          <a href="#"><i className="material-icons prefix">file_download</i></a>
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
          </div>
        </main>
        <footer className="page-footer teal">
          <div className="container">
          </div>
        </footer>
      </div>
    );
  }
}
export default Home