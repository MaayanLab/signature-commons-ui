import { Set } from 'immutable';
import M from "materialize-css";
import Base from '../../components/Base';
import React from "react";
import { Route, Switch, Redirect } from 'react-router-dom';
import { call } from '../../util/call';
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

    this.updateCart = this.updateCart.bind(this)
    this.CartActions = this.CartActions.bind(this)
  }

  componentDidMount() {
    M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  updateCart(cart) {
    this.setState({cart})
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

  signature_search = (props) => (
    <SignatureSearch
      cart={this.state.cart}
      updateCart={this.updateCart}
      {...props}
    />
  )

  metadata_search = (props) => (
    <MetadataSearch
      cart={this.state.cart}
      updateCart={this.updateCart}
      {...props}
    />
  )

  resources = (props) => (
    <Resources
      cart={this.state.cart}
      updateCart={this.updateCart}
      {...props}
    />
  )

  upload = (props) => (
    <Upload
      cart={this.state.cart}
      updateCart={this.updateCart}
      {...props}
    />
  )

  render() {
    const CartActions = this.CartActions

    return (
      <Base>
        <style jsx>{`
        #Home {
          background-image: url('${process.env.PREFIX}/static/images/arrowbackground.png');
          background-attachment: fixed;
          background-repeat: no-repeat;
          background-position: left bottom;
        }
        `}</style>
        <CartActions />
        <Switch>
          <Route
            exact path="/"
            render={() => (
              <Redirect to="/SignatureSearch" />
            )}
          />
          <Route
            path="/SignatureSearch"
            component={this.signature_search}
          />
          <Route
            path="/MetadataSearch"
            component={this.metadata_search}
          />
          <Route
            path="/Resources"
            component={this.resources}
          />
        </Switch>
      </Base>
    )
  }
}
