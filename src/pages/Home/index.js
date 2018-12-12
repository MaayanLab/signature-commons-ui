import { Set } from 'immutable';
import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import { Highlight } from '../../components/Highlight';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import Collections from '../Collections';
import MetadataSearch from '../MetadataSearch';
import SignatureSearch from '../SignatureSearch';
import { Footer } from './Footer';
import { Header } from './Header';

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

      const signature_metadata = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: signatures,
            }
          }
        }
      }, controller.signal)
      const entity_metadata = await fetch_meta_post('/entities/find', {
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


  render_signatures(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div
        className="col s12"
      >
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
                  {this.state.cart.has(signature.id) ? (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      onClick={() => {
                        this.setState({
                          cart: this.state.cart.delete(signature.id)
                        })
                      }}
                    >
                      <i className="material-icons left">remove_shopping_cart</i> Remove from Cart
                    </a>
                  ) : (
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      onClick={() => {
                        this.setState({
                          cart: this.state.cart.add(signature.id)
                        })
                      }}
                    >
                      <i className="material-icons left">add_shopping_cart</i> Add to Cart
                    </a>
                  )}

                  <a
                    href="#!"
                    className="waves-effect waves-light btn"
                    onClick={() => this.download(signature.id)}
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

        {this.state.cart.count() <= 0 ? null : (
          <div className="fixed-action-btn">
            <a
              href="#!"
              className="btn-floating btn-large teal"
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
                  onClick={this.download}
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
                  onClick={() => alert('Comming soon')}
                >
                  <i className="material-icons">send</i>
                </a>
              </li>
            </ul>
          </div>
        )}

        <MetadataSearch
          id="MetadataSearch"
          cart={this.state.cart}
          updateCart={(cart) => this.setState({cart})}
          download={this.download}
        />
        <SignatureSearch
          id="SignatureSearch"
          cart={this.state.cart}
          updateCart={(cart) => this.setState({cart})}
          download={this.download}
        />
        <Collections
          id="Collections"
          cart={this.state.cart}
          updateCart={(cart) => this.setState({cart})}
          download={this.download}
        />

        <Footer />
      </div>
    );
  }
}
