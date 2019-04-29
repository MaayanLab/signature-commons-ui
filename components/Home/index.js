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
      libraries_count: 0,
      signatures_count: 0,
      piefields: null,
      pie_controller: null,
      pie_stats: null,
      selected_field: "Assay",
      meta_counts: null,
      general_controller: null,
      counting_fields: null,
      resource_signatures: null,
      per_resource_counts: null,
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
    if(this.state.piefields===null){
        const response = (await import("../../ui-schemas/dashboard/pie_fields.json")).default
        this.setState({
          piefields: response
        },()=>{
          this.fetch_stats(this.state.selected_field)
        })
    }
    if(this.state.meta_counts===null){
      this.fetch_metacounts()
    }
    const resource_controller = new AbortController()
    this.setState({
      resource_controller: resource_controller,
    })
    // Pre computed
    if(this.state.resource_signatures===null){
      const response = (await import("../../ui-schemas/resources/all.json")).default
      const resource_signatures = response.filter(data=>data.Resource_Name!=="Enrichr").reduce((group, data)=>{
        group[data.Resource_Name] = data.Signature_Count
        return group
      }, {})
     // let for_sorting = Object.keys(resource_signatures).map(resource=>({name: resource,
     //                                                                          counts: resource_signatures[resource]}))

     //  for_sorting.sort(function(a, b) {
     //      return b.counts - a.counts;
     //  }); 
      this.setState({
        resource_signatures: resource_signatures//for_sorting.slice(0,11),
      })
    }
    // Via Server
    if(this.state.per_resource_counts===null){
      this.setState({...(await get_signature_counts_per_resources(this.state.resource_controller))})
    }
  }

  componentWillUnmount(){
    this.state.general_controller.abort()
    this.state.resource_controller.abort()
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
      const db = this.state.piefields[selected_field]
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
      const object_fields = this.state.counting_fields === null ?
                             ["Cell_Line",
                              "Disease",
                              "Gene",
                              "GO",
                              "Phenotype",
                              "Small_Molecule",
                              "Tissue",
                              "Virus"] :
                              Object.keys(this.state.counting_fields).filter(key=>this.state.counting_fields[key]=="object")
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

  async fetch_metacounts() {
    const fields = (await import("../../ui-schemas/dashboard/counting_fields.json")).default
    this.setState({
      counting_fields: fields
    })
    const object_fields = Object.keys(fields).filter(key=>fields[key]=="object")
    if(this.state.general_controller!==null){
      this.state.general_controller.abort()
    }
    try {
      const general_controller = new AbortController()
      this.setState({
        general_controller: general_controller,
      })
      // UNCOMMENT TO FETCH STUFF IN THE SERVER
      // const { response: meta_stats} = await fetch_meta({
      //   endpoint: '/signatures/value_count',
      //   body: {
      //     depth: 2,
      //     filter: {
      //       fields: Object.keys(fields)
      //     },
      //   },
      //   signal: this.state.general_controller.signal
      // })
      // const meta_counts = Object.keys(meta_stats).filter(key=>key.indexOf(".Name")>-1||
      //                                                         // (key.indexOf(".PubChemID")>-1 &&
      //                                                         //  key.indexOf("Small_Molecule")>-1) ||
      //                                                         (key.indexOf(".")===-1 && object_fields.indexOf(key)===-1))
      //                                                 .reduce((stat_list, k)=>{
      //                                                 stat_list.push({name: k.indexOf('PubChemID')!==-1 ? 
      //                                                                         k.replace("Small_Molecule.", ""):
      //                                                                         k.replace(".Name", ""),
      //                                                                 counts:Object.keys(meta_stats[k]).length})
      //                                                 return(stat_list) },
      //                                                 [])
      const meta_counts = (await import("../../ui-schemas/dashboard/saved_counts.json")).default
      meta_counts.sort((a, b) => a.name > b.name);
      this.setState({
        meta_counts: meta_counts,
      })
     } catch(e) {
         if(e.code !== DOMException.ABORT_ERR) {
           this.setState({
             status: ''
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
            component={this.landing}
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