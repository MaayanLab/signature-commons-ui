import React from 'react'
import { Set } from 'immutable'
import { Route, Switch, Redirect } from 'react-router-dom'
import NProgress from 'nprogress'
import dynamic from 'next/dynamic'
import { connect } from "react-redux";
import { MuiThemeProvider } from '@material-ui/core'

import Base from '../../components/Base'
import { call } from '../../util/call'
import Landing from '../Landing'
import Resources from '../Resources'
import MetadataSearch from '../MetadataSearch'
import SignatureSearch from '../SignatureSearch'

import Pages from '../Pages'

import { base_url as meta_url } from '../../util/fetch/meta'
import theme from '../../util/theme-provider'
import '../../styles/swagger.scss'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })


const mapStateToProps = (state, ownProps) => {
  return { 
    ui_values: state.serverSideProps.ui_values
  }
};


class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
    }
  }


  resources = (props) => (
    <Resources
      {...props}
    />
  )

  // upload = (props) => (
  //   <Upload
  //     cart={this.state.cart}
  //     updateCart={this.updateCart}
  //     {...props}
  //   />
  // )

  api = (props) => (
    <SwaggerUI
      url={`${meta_url}/openapi.json`}
      deepLinking={true}
      displayOperationId={true}
      filter={true}
    />
  )

  // collection = (props) => (
  //   <Collection
  //     ui_values={this.props.ui_values}
  //     {...props}
  //   />
  // )

  landing = (props) => {
    return(
      <Landing 
        {...props}
      />
    )}

  metadata_search = (props) => (
    <MetadataSearch 
      {...props}
    />
    )

  signature_search = (props) => (
    <SignatureSearch 
      {...props}
    />
    )

  pages = (props) => {
    return(
      <Pages {...props}/>
    )
  }

  render = () => (
    <MuiThemeProvider theme={theme}>
      <Base ui_values={this.props.ui_values}
        handleChange={this.handleChange}
      >
        <style jsx>{`
        #Home {
          background-image: url('${process.env.PREFIX}/static/images/arrowbackground.png');
          background-attachment: fixed;
          background-repeat: no-repeat;
          background-position: left bottom;
        }
        `}</style>
        <Switch>}
          {this.props.ui_values.nav.MetadataSearch.active ?
            <Route
              path={this.props.ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}
              exact
              component={this.landing}
            />
            : null
          }
          {this.props.ui_values.nav.MetadataSearch.active ?
            <Route
              path={`${this.props.ui_values.nav.MetadataSearch.endpoint || "/MetadataSearch"}/:table`}
              component={this.metadata_search}
            />
            : null
          }
          {this.props.ui_values.nav.SignatureSearch.active ?
            <Route
              path={this.props.ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}
              exact
              component={(props)=>{
              return <Redirect to={`${this.props.ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}/Overlap`} />}}
            />
            : null
          }
          {this.props.ui_values.nav.SignatureSearch.active ?
            <Route
              path={`${this.props.ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}/:type`}
              exact
              component={this.landing}
            />
           : null
          }
          {this.props.ui_values.nav.SignatureSearch.active ?
            <Route
              path={`${this.props.ui_values.nav.SignatureSearch.endpoint || "/SignatureSearch"}/:type/:id`}
              component={this.signature_search}
            />
           : null
          }
          {this.props.ui_values.nav.Resources.active ?
            <Route
              path={`${this.props.ui_values.nav.Resources.endpoint || "/Resources"}`}
              component={this.resources}
            /> : null
          }
          <Route
            path="/:table/:id"
            component={this.pages}
          />
          <Route
            path={`${this.props.ui_values.nav.API.endpoint || "/API"}`}
            component={this.api}
          />
          <Route
            path="/not-found"
            component={(props)=>{
            return <div />}}//{this.landing}
          />
          <Route
            path="/:otherendpoint"
            component={props=>{
              console.log(props)
            return <Redirect to='/not-found'/>}}
          />
          <Route
            path="/"
            exact
            component={this.landing}//{this.landing}
          />
        </Switch>
      </Base>
    </MuiThemeProvider>
  )
}

export default connect(mapStateToProps)(Home)