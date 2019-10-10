import React from 'react'
import { Set } from 'immutable'
import { Route, Switch } from 'react-router-dom'
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
    ...state.serverSideProps,

  }
};


class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
    }
  }


  // signature_search = (props) => (
  //   <SignatureSearch
  //     cart={this.state.cart}
  //     updateCart={this.updateCart}
  //     signature_keys={this.props.signature_keys}
  //     libraries={this.props.libraries}
  //     resources={this.props.resources}
  //     library_resource={this.props.library_resource}
  //     ui_values={this.props.ui_values}
  //     schemas={this.props.schemas}
  //     handleChange={this.handleChange}
  //     changeSignatureType={this.changeSignatureType}
  //     updateSignatureInput={this.updateSignatureInput}
  //     resetAllSearches={this.resetAllSearches}
  //     submit={this.submit}
  //     {...props}
  //     {...this.state.signature_search}
  //   />
  // )

  // metadata_search = (props) => (
  //   <MetadataSearch
  //     cart={this.state.cart}
  //     updateCart={this.updateCart}
  //     ui_values={this.props.ui_values}
  //     schemas={this.props.schemas}
  //     currentSearchArrayChange={this.currentSearchArrayChange}
  //     performSearch={this.performSearch}
  //     handleChange={this.handleChange}
  //     resetAllSearches={this.resetAllSearches}
  //     submit={this.submit}
  //     {...props}
  //     {...this.state.metadata_search}
  //   />
  // )

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

  landing = (props) => (
    <Landing 
      {...props}
    />
    )

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
        <Switch>
          {this.props.ui_values.nav.metadata_search ?
            <Route
              path={"/MetadataSearch/:table"}
              component={this.metadata_search}
            /> : null
          }
          {this.props.ui_values.nav.signature_search ?
            <Route
              path={"/SignatureSearch/:type/:id"}
              component={this.signature_search}
            /> : null
          }
          {this.props.ui_values.nav.resources ?
            <Route
              path={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
              component={this.resources}
            /> : null
          }
          <Route
            path="/API"
            component={this.api}
          />
          <Route
            path="/not-found"
            component={(props)=>{
            return <div />}}//{this.landing}
          />
          <Route
            path="/"
            component={this.landing}//{this.landing}
          />
        </Switch>
      </Base>
    </MuiThemeProvider>
  )
}

export default connect(mapStateToProps)(Home)