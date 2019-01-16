import { Set } from 'immutable';
import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import Style from 'style-it';
import { call } from '../../util/call';
import { fetch_data } from "../../util/fetch/data";
import { base_url as meta_base_url, fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import MetadataSearch from '../MetadataSearch';
import Resources from '../Resources';
import SignatureSearch from '../SignatureSearch';
import Upload from '../Upload';

const Header = () => (
  <header>
    <nav className="nav-extended">
      <div className="nav-wrapper blue">
        <a
          href="/"
          className="brand-logo center"
          style={{
            whiteSpace: 'nowrap',
          }}
        >Signature Commons</a>
        {/* <a href="#!" data-target="slide-out" className="sidenav-trigger show-on-large"><i className="material-icons">menu</i></a> */}
      </div>
      <div className="nav-content blue">
        <ul className="tabs tabs-transparent">
          <li className="tab">
            <a href="#SignatureSearch">
              Signature Search
            </a>
          </li>
          <li className="tab">
            <a href="#MetadataSearch">
              Metadata Search
            </a>
          </li>
          <li className="tab">
            <a href="#Resources">
              Resources
            </a>
          </li>
          <li className="tab">
            <a href="#UploadCollection">
              Upload
            </a>
          </li>
          <li className="tab">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://petstore.swagger.io/?url=${meta_base_url}/openapi.json`}
            >
              API
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
)

const Footer = () => (
  <footer className="page-footer grey lighten-3 black-text">
    <div className="container">
      <div className="row">
        <div className="col l4 m6 s12">
          <a className="github-button" href="https://github.com/dcic/signature-commons-ui" data-size="large" aria-label="View Source Code dcic/signature-commons-ui on GitHub">View Source Code</a><br />
          <a className="github-button" href="https://github.com/dcic/signature-commons-ui/issues" data-size="large" aria-label="Submit Bug Report dcic/signature-commons-ui on GitHub">Submit Bug Report</a>
        </div>

        <div className="col offset-l6 l2 m6 s12">
          <img src="static/images/dcic.png" alt="BD2K-LINCS Data Coordination and Integration Center" height="130" /><br />
        </div>
      </div>
    </div>
  </footer>
)

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      cart: Set(),
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
    this.download = this.download.bind(this)
    this.updateCart = this.updateCart.bind(this)
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
      const {duration: duration_meta_1, contentRange, response: results} = await fetch_meta_post('/signatures/find', {
        filter: {
          where,
          limit: 20,
        },
      }, controller.signal)

      this.setState({
        results,
        status: '',
        time: Date.now() - start,
        count: contentRange.count,
        duration_meta: duration_meta_1,
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
    const {duration: duration_meta_1, response: value_count} = await fetch_meta('/signatures/value_count', {
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
    try {
      const controller = new AbortController()

      let ids
      if(id === undefined) {
        ids = this.state.cart.toArray()
      } else {
        ids = [id]
      }

      const signature_data = (await fetch_data('/fetch/set', {
        entities: [],
        signatures: ids,
        database: 'enrichr',
      }, controller.signal)).signatures
      
      const signatures = signature_data.map((sig) => sig.uid)
      const entities = signature_data.reduce((all, sig) => [...all, ...sig.entities], [])

      const {duration: duration_meta_1, response: signature_metadata} = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: signatures,
            }
          }
        }
      }, controller.signal)
      const {duration: duration_meta_2, response: entity_metadata} = await fetch_meta_post('/entities/find', {
        filter: {
          where: {
            id: {
              inq: entities,
            }
          }
        }
      }, controller.signal)
      const data = {
        entities: entity_metadata,
        signatures: signature_metadata,
        values: signature_data,
      }
      fileDownload(JSON.stringify(data), 'data.json');
    } catch(e) {
      console.error(e)
    }
  }

  updateCart(cart) {
    this.setState({cart})
  }

  render() {
    return Style.it(`
      #Home {
        background-image: url('static/images/arrowbackground.png');
        background-attachment: fixed;
        background-repeat: no-repeat;
        background-position: left bottom;
      }
      `, (
        <div id="Home" className="root">
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

          {this.state.cart.count() <= 0 ? null : (
            <div className="fixed-action-btn">
              <a
                href="#!"
                className="btn-floating btn-large blue"
              >
                <i className="large material-icons">shopping_cart</i>
              </a>
              <span style={{
                position: 'absolute',
                top: '-0.1em',
                fontSize: '150%',
                left: '1.4em',
                zIndex: 1,
                color: 'white',
                backgroundColor: 'blue',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                textAlign: 'center',
                verticalAlign: 'middle',
              }}>
                {this.state.cart.count()}
              </span>
              <ul>
                <li>
                  <a
                    href="#!"
                    className="btn-floating red"
                    onClick={call(this.download, undefined)}
                  >
                    <i className="material-icons">file_download</i>
                  </a>
                </li>
                <li>
                  <a
                    href="#SignatureSearch"
                    className="btn-floating green"
                  >
                    <i className="material-icons">functions</i>
                  </a>
                </li>
                <li>
                  <a
                    href="#!"
                    className="btn-floating grey"
                    onClick={call(alert, 'Comming soon')}
                  >
                    <i className="material-icons">send</i>
                  </a>
                </li>
              </ul>
            </div>
          )}

          <SignatureSearch
            id="SignatureSearch"
            cart={this.state.cart}
            updateCart={this.updateCart}
            download={this.download}
          />
          <MetadataSearch
            id="MetadataSearch"
            cart={this.state.cart}
            updateCart={this.updateCart}
            download={this.download}
          />
          <Resources
            id="Resources"
            cart={this.state.cart}
            updateCart={this.updateCart}
            download={this.download}
          />
          <Upload
            id="UploadCollection"
            cart={this.state.cart}
            updateCart={this.updateCart}
            download={this.download}
        />

          <Footer />
        </div>
      )
    );
  }
}
