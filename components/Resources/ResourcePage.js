import React from 'react'
import IconButton from '../../components/IconButton';
import { call } from '../../util/call';
import { ShowMeta } from '../../components/ShowMeta';
import { Label } from '../../components/Label';
import { Link } from 'react-router-dom'
import M from 'materialize-css'

export default class ResourcePage extends React.Component {
  constructor(props) {
    super(props)

    this.download = this.download.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.removeFromCart = this.removeFromCart.bind(this)
  }

  componentDidMount() {
    M.AutoInit()
  }

  redirectLink(url){
    return (e) => window.open(url, '_blank').focus();
  }

  async download(library_id) {
    alert('coming soon')
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

  render() {
    return (
      <div className="row">
        <div className="col s12">

          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="row">
                  <div className="col s12">
                    <div className="card-image col s1">
                      <IconButton
                        img={this.props.resource.meta.icon}
                        onClick={call(this.redirectLink, this.props.resource.meta.URL)}
                      />
                    </div>
                    <div className="card-content col s11">
                      <div>
                        <span className="card-title">{this.props.resource.meta.name}</span>
                      </div>
                      <div>
                        <span>
                          <b>Signature count:</b>&nbsp;
                            {this.props.resource.meta.Signature_Count}
                        </span>
                      </div>
                      <div>
                        <span>
                          <b>PMID:</b>&nbsp;
                          <a 
                            href={"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props.resource.meta.PMID}
                          >
                            {this.props.resource.meta.PMID}
                          </a>
                        </span>
                      </div>
                      <div>
                        <span>
                          <b>URL:</b>&nbsp;
                          <a
                            href={this.props.resource.meta.URL}
                          >
                            {this.props.resource.meta.URL}
                          </a>
                        </span>
                      </div>
                      <div>
                        <p>{this.props.resource.meta.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-action">
                  <Link
                    to="/Resources"
                    className="waves-effect waves-teal btn-flat" 
                  >
                    BACK
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col s12">
              <ul
                className="collapsible popout"
              >
                {this.props.resource.libraries.map((library) => (
                  <li
                    key={library.id}
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
                          item={library}
                          visibility={1}
                        />
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: "row",
                      }}>
                        <IconButton
                          alt="Signature Commons"
                          img={`${process.env.PREFIX}/static/favicon.ico`}
                        />
                        &nbsp;
                        <IconButton
                          alt="Download"
                          icon="file_download"
                          onClick={call(this.download, library.id)}
                        />
                        &nbsp;
                        {this.props.cart.has(library.id) ? (
                          <IconButton
                            alt="Remove from Cart"
                            icon="remove_shopping_cart"
                            onClick={call(this.removeFromCart, library.id)}
                          />
                        ) : (
                          <IconButton
                            alt="Add to Cart"
                            icon="add_shopping_cart"
                            onClick={call(this.addToCart, library.id)}
                          />
                        )}
                        <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                        <a
                          href="javascript:void(0);"
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
                      <ShowMeta
                        value={{
                          '@id': library.id,
                          '@type': 'Library',
                          'meta': library.meta,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
