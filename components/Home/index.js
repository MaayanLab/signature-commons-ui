import { Set } from 'immutable';
import M from "materialize-css";
import Base from '../../components/Base';
import React from "react";
import { Route, Switch, Redirect } from 'react-router-dom';
import { call } from '../../util/call';
import Landing from '../Landing';
import MetadataSearch from '../MetadataSearch';
import Resources from '../Resources';
import SignatureSearch from '../SignatureSearch';
import Upload from '../Upload';

import { fetch_meta } from '../../util/fetch/meta'
import {get_signature_counts_per_resources} from '../Resources/resources.js'

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
      pie_controller: null,
      pie_stats: null,
      selected_field: "Assay",
      pie_controller: null,
    }
    this.updateCart = this.updateCart.bind(this)
    this.CartActions = this.CartActions.bind(this)
    this.handleSelectField = this.handleSelectField.bind(this);

  }

  async componentDidMount() {
    M.AutoInit();
    if(this.state.libraries_count===0){
      this.fetch_count("libraries")
    }
    if(this.state.signatures_count===0){
      this.fetch_count("signatures")
    }
    if(this.state.pie_stats===null){
      this.fetch_stats(this.state.selected_field)
    }
  }

  componentWillUnmount(){
    this.state.pie_controller.abort()
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

  async fetch_count(source) {
    const { response } = await fetch_meta({ endpoint: `/${source}/count`, body: {} })
    if(source==="libraries"){
      this.setState({
        libraries_count: response.count
      })
    }else if(source==="signatures"){
      this.setState({
        signatures_count: response.count
      })
    }
  }

  async fetch_stats(selected_field){
    try {
      const pie_controller = new AbortController()
      const db = this.props.piefields[selected_field]
      if( this.state.pie_controller !== null) {
          this.state.pie_controller.abort()
        }
      this.setState({
        pie_controller: pie_controller,
      })

      const url = '/' + db.toLowerCase() +
                  '/value_count?depth=2&filter={"fields":["' +
                  selected_field +'"]}'
      const { response: stats} = await fetch_meta({
        endpoint: url,
        signal: pie_controller.signal
      })

      let stat_vals = undefined
      const object_fields = this.props.counting_fields === null ?
                             ["Cell_Line",
                              "Disease",
                              "Gene",
                              "GO",
                              "Phenotype",
                              "Small_Molecule",
                              "Tissue",
                              "Virus"] :
                              Object.keys(this.props.counting_fields).filter(key=>this.props.counting_fields[key]=="object")
      if(object_fields.includes(selected_field)){
        stat_vals = stats[selected_field + ".Name"]
      }else{
        stat_vals = stats[selected_field]
      }
      this.setState({
        pie_stats: stat_vals,
      })
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          pie_status: ''
        })
      }
    }
  }

  handleSelectField(e){
    const field = e.target.value
    this.setState({
      selected_field: field,
      pie_stats: null,
    },()=>{
     this.fetch_stats(this.state.selected_field)
    })
  }

  landing = (props) => (
    <Landing
      handleSelectField={this.handleSelectField}
      {...this.state}
      {...props}
    />
  )

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
            render={(router_props) => <Landing handleSelectField={this.handleSelectField}
                                               {...this.state}
                                               {...this.props}
                                               {...router_props}/>}
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
          <Route
            path="/UploadCollection"
            component={this.upload}
          />
        </Switch>
      </Base>
    )
  }
}