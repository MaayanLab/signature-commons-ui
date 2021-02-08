import React from 'react'
import { Set } from 'immutable'
import { Route, Switch, Redirect } from 'react-router-dom'
import dynamic from 'next/dynamic'
import { connect } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import ErrorIcon from '@material-ui/icons/Error'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import {DataResolver} from '../../connector'

import Base from '../../components/Base'
import About from '../../components/About'
import Landing from '../Landing'
import Resources from '../Resources'
import MetadataSearch from '../Search/MetadataSearch'
import SignatureSearch from '../Search/SignatureSearch'
import MetadataPage from '../MetadataPage'

import { base_url as meta_url } from '../../util/fetch/meta'
import { base_url as data_url } from '../../util/fetch/data'
import { closeSnackBar, initializeTheme } from '../../util/redux/actions'
import '../../styles/swagger.scss'
import Lazy from '../Lazy'
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })


const mapStateToProps = (state) => {
  return {
    ui_values: state.ui_values,
    theme: state.theme,
    error_message: state.error_message,
    schemas: state.serverSideProps.schemas,
    search_filters: state.search_filters,
    resource_libraries: {
      lib_id_to_name: state.lib_id_to_name,
      lib_name_to_id: state.lib_name_to_id,
      resource_name_to_id: state.resource_name_to_id,
      resource_id_to_name: state.resource_id_to_name,
      lib_to_resource: state.lib_to_resource,
      resource_to_lib: state.resource_to_lib,
    },
  }
}

function mapDispatchToProps(dispatch) {
  return {
    initializeTheme: (theme) => {
      dispatch(initializeTheme(theme))
    },
    closeSnackBar: () => {
      dispatch(closeSnackBar())
    },
  }
}

const snackStyles = (theme) => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
})

const SigcomSnackbar = withStyles(snackStyles)((props) => {
  const { classes, message, onClose, variant, ...other } = props

  return (
    <SnackbarContent
      className={`${classes.error}`}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <ErrorIcon className={`${classes.icon} ${classes.iconVariant}`} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  )
})

class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
      theme: null,
      enrichment_resolver: new DataResolver(),
      metadata_resolver: new DataResolver()
    }
  }



  resources = (props) => (
    <Resources
      {...props}
      schemas={this.props.schemas}
      preferred_name={this.props.ui_values.preferred_name}
      model={"resources"}
      resolver={this.state.metadata_resolver}
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
    <Grid container>
      {this.props.ui_values.nav.MetadataSearch.active ?
      <Grid xs={12} lg={this.props.ui_values.nav.SignatureSearch.active ? 6 : 12}>
        <Lazy>{async () => (
          <SwaggerUI
            url={`${await meta_url()}/openapi.json`}
            deepLinking={true}
            displayOperationId={true}
            filter={true}
          />
        )}</Lazy>
      </Grid> : null }
      {this.props.ui_values.nav.SignatureSearch.active ?
      <Grid xs={12} lg={this.props.ui_values.nav.MetadataSearch.active ? 6 : 12}>
        <Lazy>{async () => (
          <SwaggerUI
            url={`${await data_url()}/swagger.yml`}
            deepLinking={true}
            displayOperationId={true}
            filter={true}
          />
        )}</Lazy>
      </Grid> : null}
    </Grid>
  )

  // collection = (props) => (
  //   <Collection
  //     ui_values={this.props.ui_values}
  //     {...props}
  //   />
  // )

  landing = (props) => {
    return (
      <Landing
        {...props}
      />
    )
  }


  metadata_search = (props) => {
    const reverse_preferred = Object.entries(this.props.ui_values.preferred_name).reduce((names,[k,v])=>{
      names[v] = k
      return names
    }, {})
    const model = reverse_preferred[props.match.params.model]
    if (model === undefined) return <Redirect to='/not-found'/>
    return (
      <MetadataSearch schemas={this.props.schemas}
                    resource_libraries={this.props.resource_libraries}
                    preferred_name={this.props.ui_values.preferred_name}
                    preferred_name_singular={this.props.ui_values.preferred_name_singular}
                    model={model}
                    label={props.match.params.label}
                    filter_props={this.props.search_filters[model] || []}
                    nav={this.props.ui_values.nav}
                    search_examples={this.props.ui_values.search_examples[model] || []}
                    resolver={this.state.metadata_resolver}
                    {...props}
      />
    )
  }

  signature_search = (props) => {
    const reverse_preferred = Object.entries(this.props.ui_values.preferred_name).reduce((names,[k,v])=>{
      names[v] = k
      return names
    }, {})
    let model = 'resources'
    if (props.match.params.model){
      model = reverse_preferred[props.match.params.model]
      if (model!=='resources') return <Redirect to='/not-found'/>
    }
    return (
      <SignatureSearch schemas={this.props.schemas}
                    resource_libraries={this.props.resource_libraries}
                    preferred_name={this.props.ui_values.preferred_name}
                    preferred_name_singular={this.props.ui_values.preferred_name_singular}
                    label={props.match.params.label}
                    nav={this.props.ui_values.nav}
                    examples={this.props.ui_values.examples}
                    resolver={this.state.enrichment_resolver}
                    filter_props={this.props.search_filters.signatures || []}
                    model={model}
                    {...props}
      />
    )
  }

  metadata_pages = (props) => {
    const reverse_preferred = Object.entries(this.props.ui_values.preferred_name).reduce((names,[k,v])=>{
      names[v] = k
      return names
    }, {})
    const id = props.match.params.id
    const model = reverse_preferred[props.match.params.model]
    if (model === undefined) return <Redirect to='/not-found'/>
    return (
      <MetadataPage schemas={this.props.schemas}
                    resource_libraries={this.props.resource_libraries}
                    preferred_name={this.props.ui_values.preferred_name}
                    preferred_name_singular={this.props.ui_values.preferred_name_singular}
                    id={id}
                    model={model}
                    nav={this.props.ui_values.nav}
                    label={props.match.params.label}
                    metadata_resolver={this.state.metadata_resolver}
                    enrichment_resolver={this.state.enrichment_resolver}
                    {...props}
      />
    )
  }

  about = (props) => {
    return (
      <About {...props} ui_values={this.props.ui_values}/>
    )
  }

  render = () => {
    if (this.props.theme === null) {
      return <CircularProgress />
    }
    return (
      <MuiThemeProvider theme={this.props.theme}>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.props.error_message !== null}
          autoHideDuration={6000}
          onClose={this.props.closeSnackBar}
        >
          <SigcomSnackbar
            onClose={this.handleClose}
            message={this.props.error_message}
          />
        </Snackbar>
        <Base location={this.props.location}
          footer_type={this.props.ui_values.footer_type}
          github={this.props.ui_values.github}
          github_issues={this.props.ui_values.github_issues}
          ui_values={this.props.ui_values}
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
            {this.props.ui_values.nav.MetadataSearch.active ?
              <Route
                path={this.props.ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}
                exact
                component={()=><Redirect to={`${this.props.ui_values.nav.MetadataSearch.endpoint}/${this.props.ui_values.preferred_name.signatures}`} />}
              />
              : null
            }
            {this.props.ui_values.nav.MetadataSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}/:model`}
                component={this.metadata_search}
              />
              : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}
                exact
                component={(props) => {
                  return <Redirect to={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}${this.props.ui_values.overlap_search ? '/Overlap' : '/Rank'}`} />
                }}
              />
              : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type`}
                exact
                component={this.signature_search}
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id`}
                component={this.signature_search}
                exact
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id/:model`}
                component={this.signature_search}
                exact
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id/:model/:id`}
                component={this.signature_search}
                exact
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`/Enrichment/:type/:enrichment_id/:model/:id`}
                component={this.metadata_pages}
                exact
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`/Enrichment/:type/:enrichment_id`}
                component={(props)=>{
                  const {type, enrichment_id} = props.match.params
                  return <Redirect to={`${this.props.ui_values.nav.SignatureSearch.endpoint}/${type}/${enrichment_id}`}/>
                }}
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`/Enrichment/:type`}
                component={(props)=>{
                  const {type, enrichment_id} = props.match.params
                  return <Redirect to={`${this.props.ui_values.nav.SignatureSearch.endpoint}/${type}`}/>
                }}
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`/Enrichment`}
                component={(props)=>{
                  const {type, enrichment_id} = props.match.params
                  return <Redirect to={`${this.props.ui_values.nav.SignatureSearch.endpoint}/Overlap`}/>
                }}
              />
             : null
            }
            {this.props.ui_values.nav.Resources.active ?
              <Route
                path={`${this.props.ui_values.nav.Resources.endpoint || '/Resources'}`}
                exact
                component={this.resources}
              /> : null
            }
            {this.props.ui_values.about !== undefined ?
              <Route
                path={'/About'}
                component={this.about}
              /> : null
            }
            <Route
              path="/:model/:id"
              component={this.metadata_pages}
            />
            <Route
              path="/:model/:id/:label"
              component={this.metadata_pages}
            />
            <Route
              path={`${this.props.ui_values.nav.API.endpoint || '/API'}`}
              component={this.api}
            />
            <Route
              path="/not-found"
              component={(props) => {
                return <div>You're not supposed to be here</div>
              }}// {this.landing}
            />
            <Route
              path="/:otherendpoint"
              component={(props) => {
                return <Redirect to='/not-found'/>
              }}
            />
            <Route
              path="/"
              exact
              component={this.landing}// {this.landing}
            />
          </Switch>
        </Base>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
