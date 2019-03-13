import React from 'react'
import IconButton from '../../components/IconButton';
import { ShowMeta } from '../../components/ShowMeta';
import { Label } from '../../components/Label';
import M from "materialize-css";
import { call } from '../../util/call';
import { get_library_resources } from './resources';

export default class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: [],
      selected: null,
    }

    this.download = this.download.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.removeFromCart = this.removeFromCart.bind(this)
    this.redirectLink = this.redirectLink.bind(this)
  }

  async componentDidMount() {
    const {
      libraries, resources, library_resource
    } = await get_library_resources()
    this.setState({
      libraries,
      resources: Object.values(resources),
      library_resource,
    })
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

  redirectLink(e){
    window.open(this.state.selected.URL, '_blank').focus();
  }

  render() {
    const sorted_resources = [...this.state.resources].sort((r1, r2) => r1.name.localeCompare(r2.name))
    return this.state.selected ? (
      <div className="row">
        <div className="col s12">
          
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="row">
                  <div className="col s12">
                    <div className="card-image col s1">
                      <IconButton
                      img={this.state.selected.icon}
                      onClick={this.redirectLink}
                      />
                    </div>
                    <div className="card-content col s11">
                      <div>
                        <span className="card-title">{this.state.selected.name}</span>
                      </div>
                      <div>
                        <span>
                          <b>PMID:</b>&nbsp;
                          <a 
                            href={"https://www.ncbi.nlm.nih.gov/pubmed/" + this.state.selected.PMID}
                          >
                            {this.state.selected.PMID}
                          </a>
                        </span>
                      </div>
                      <div>
                        <span>
                          <b>URL:</b>&nbsp;
                          <a
                            href={this.state.selected.URL}
                          >
                            {this.state.selected.URL}
                          </a>
                        </span>
                      </div>
                      <div>
                        <p>{this.state.selected.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-action">
                  <a
                    className="waves-effect waves-teal btn-flat" 
                    onClick={() => this.setState({ selected: null })}
                  >
                    BACK
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col s12">
              <ul
                className="collapsible popout"
              >
                {this.state.selected.libraries.map((library) => (
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
    ) : (
      <div className="row">
        <div className="col offset-s2 s8">
          {sorted_resources.map((resource) => (
            <IconButton
              key={resource.name}
              alt={resource.name}
              img={resource.icon}
              onClick={() => this.setState({ selected: resource }, () => M.AutoInit())}
            />
          ))}
        </div>
      </div>
    )
  }
}