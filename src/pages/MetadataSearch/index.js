import M from "materialize-css";
import React from "react";
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import { call } from '../../util/call';
import { Label } from '../../components/Label';
import IconButton from '../../components/IconButton';

const count = 'half a million'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      duration: 0,
      count: 0,
      duration_meta: 0,
      key_count: {},
      value_count: {},
      status: null,
      controller: null,
    }

    this.submit = this.submit.bind(this)
    this.build_where = this.build_where.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.removeFromCart = this.removeFromCart.bind(this)
    this.searchAndSubmit = this.searchAndSubmit.bind(this)
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
      const {duration: duration_meta_1, contentRange, response: signatures} = await fetch_meta_post('/signatures/find', {
        filter: {
          where,
          limit: 20,
        },
      }, controller.signal)

      const library_ids = [...new Set(signatures.map((sig) => sig.library))]
      const {duration: duration_meta_2, response: libraries} = await fetch_meta_post('/libraries/find', {
        filter: {
          where: {
            id: {
              inq: library_ids
            }
          },
        },
      }, controller.signal)
      this.setState({
        duration_meta: duration_meta_1 + duration_meta_2,
      })

      const library_dict = libraries.reduce((L, l) => ({...L, [l.id]: l}), {})
      
      for(const signature of signatures)
        signature.library = library_dict[signature.library]

      this.setState({
        results: signatures,
        status: '',
        duration: (Date.now() - start) / 1000,
        count: contentRange.count,
      })
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + ''
        })
      }
    }
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

  searchChange(e) {
    this.setState({search: e.target.value})
  }

  searchAndSubmit(example) {
    this.setState(
      {
        search: example,
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
                  <Label
                    item={signature}
                    highlight={this.state.search}
                    visibility={1}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: "row",
                }}>
                  <IconButton
                    alt="Enrichr"
                    img="static/images/enrichr.ico"
                  />
                  &nbsp;
                  <IconButton
                    alt="Geneshot"
                    img="static/images/geneshot.png"
                  />
                  &nbsp;
                  <IconButton
                    alt="ARCHS4"
                    img="static/images/archs4.png"
                  />
                  &nbsp;
                  <IconButton
                    alt="Signature Commons"
                    img="favicon.ico"
                  />
                  &nbsp;
                  <IconButton
                    alt="Download"
                    icon="file_download"
                    onClick={call(this.props.download, signature.id)}
                  />
                  &nbsp;
                  {this.props.cart.has(signature.id) ? (
                    <IconButton
                      alt="Remove from Cart"
                      icon="remove_shopping_cart"
                      onClick={call(this.removeFromCart, signature.id)}
                    />
                  ) : (
                    <IconButton
                      alt="Add to Cart"
                      icon="add_shopping_cart"
                      onClick={call(this.addToCart, signature.id)}
                    />
                  )}
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
                  onChange={this.searchChange}
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
                <button className="btn waves-effect waves-light blue" type="submit" name="action">Search
                  <i className="material-icons right">send</i>
                </button>
              </div>
              {['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'].map((example) => (
                <div
                  key={example}
                  className="chip grey darken-2 white-text waves-effect waves-light"
                  onClick={call(this.searchAndSubmit, example)}
                >{example}</div>
              ))}
            </form>
          </div>
          <div className="col s2"></div>
          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                {this.state.count} results of 654247 ({this.state.duration.toPrecision(3)} seconds total, {this.state.duration_meta.toPrecision(3)} on metadata)
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
