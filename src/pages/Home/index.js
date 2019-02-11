import { Set } from 'immutable';
import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import { Link, Route, Switch } from 'react-router-dom';
import Style from 'style-it';
import { call } from '../../util/call';
import { fetch_data } from "../../util/fetch/data";
import { base_url as meta_base_url, fetch_meta_post } from "../../util/fetch/meta";
import MetadataSearch from '../MetadataSearch';
import Resources from '../Resources';
import SignatureSearch from '../SignatureSearch';
import Upload from '../Upload';

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
    }

    this.download = this.download.bind(this)
    this.updateCart = this.updateCart.bind(this)
    this.CartActions = this.CartActions.bind(this)
    this.Header = this.Header.bind(this)
    this.Nav = this.Nav.bind(this)
  }

  componentDidMount() {
    M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  async download(id) {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }

    try {
      const controller = new AbortController()
      this.setState({
        controller,
      })

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

      const {response: signature_metadata} = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: signatures,
            }
          }
        }
      }, controller.signal)
      const {response: entity_metadata} = await fetch_meta_post('/entities/find', {
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
        controller: null,
      }
      fileDownload(JSON.stringify(data), 'data.json');
    } catch(e) {
      console.error(e)
    }
  }

  updateCart(cart) {
    this.setState({cart})
  }

  Nav(props) {
    return (
      <ul {...props}>
        <li
          className={this.props.location.pathname === '/SignatureSearch' ? 'active' : ''}
        >
          <Link to="/SignatureSearch">
            Signature Search
          </Link>
        </li>
        <li
          className={this.props.location.pathname === '/MetadataSearch' ? 'active' : ''}
        >
          <Link to="/MetadataSearch">
            Metadata Search
          </Link>
        </li>
        <li
          className={this.props.location.pathname === '/Resources' ? 'active' : ''}
        >
          <Link to="/Resources">
            Resources
          </Link>
        </li>
        <li
          className={this.props.location.pathname === '/UploadCollection' ? 'active' : ''}
        >
          <Link to="/UploadCollection">
            Upload
          </Link>
        </li>
        <li>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://petstore.swagger.io/?url=${meta_base_url}/openapi.json`}
          >
            API
          </a>
        </li>
      </ul>
    )
  }

  Header(props) {
    const Nav = this.Nav
    return (
      <header>
        <nav className="nav-extended">
          <div className="nav-wrapper">
            <a
              href="/"
              className="brand-logo left hide-on-med-and-down"
              style={{
                whiteSpace: 'nowrap',
              }}
            >&nbsp;&nbsp; <img src="favicon.ico" width={22} />&nbsp; Signature Commons</a>
            <a
              href="/"
              className="brand-logo center hide-on-large-only"
              style={{
                whiteSpace: 'nowrap',
              }}
            > Signature Commons</a>
            <a href="#" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
            <Nav id="nav-mobile" className="right hide-on-med-and-down" location={props.location} />
          </div>
          <Nav className="sidenav" id="mobile-menu" location={props.location} />
        </nav>
      </header>
    )
  }

  Footer() {
    return (
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
  }

  CartActions() {
    return this.state.cart.count() <= 0 ? null : (
      <div className="fixed-action-btn">
        <a
          href="javascript:void(0);"
          className="btn-floating btn-large"
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
              href="javascript:void(0);"
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
              href="javascript:void(0);"
              className="btn-floating grey"
              onClick={call(alert, 'Comming soon')}
            >
              <i className="material-icons">send</i>
            </a>
          </li>
        </ul>
      </div>
    )
  }

  render() {
    const Header = this.Header
    const Footer = this.Footer
    const CartActions = this.CartActions

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

          <CartActions />

          <main>
            <div className="container">
              <Switch>
                <Route
                  exact path="/"
                  component={(props) =>
                    <SignatureSearch
                      cart={this.state.cart}
                      updateCart={this.updateCart}
                      download={this.download}
                      {...props}
                    />
                  }
                />
                <Route
                  exact path="/SignatureSearch"
                  component={(props) =>
                    <SignatureSearch
                      cart={this.state.cart}
                      updateCart={this.updateCart}
                      download={this.download}
                      {...props}
                    />
                  }
                />
                <Route
                  exact path="/MetadataSearch"
                  component={(props) =>
                    <MetadataSearch
                      cart={this.state.cart}
                      updateCart={this.updateCart}
                      download={this.download}
                      {...props}
                    />
                  }
                />
                <Route
                  exact path="/Resources"
                  component={(props) =>
                    <Resources
                      cart={this.state.cart}
                      updateCart={this.updateCart}
                      download={this.download}
                      {...props}
                    />
                  }
                />
                <Route
                  exact path="/UploadCollection"
                  component={(props) =>
                    <Upload
                      cart={this.state.cart}
                      updateCart={this.updateCart}
                      download={this.download}
                      {...props}
                    />
                  }
                />
              </Switch>
            </div>
          </main>

          <Footer />
        </div>
      )
    );
  }
}
