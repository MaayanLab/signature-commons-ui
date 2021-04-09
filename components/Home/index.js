import React from 'react'
import { Set } from 'immutable'
import { Route, Switch, Redirect } from 'react-router-dom'
import dynamic from 'next/dynamic'
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
import {Terms} from '../../components/About/Terms'

import Resources from '../Resources'
import MetadataSearch from '../Search/MetadataSearch'
import SignatureSearch from '../Search/SignatureSearch'
import MetadataPage from '../MetadataPage'

import {IFramePage} from '../IFramePage'

import { base_url as meta_url } from '../../util/fetch/meta'
import { base_url as data_url } from '../../util/fetch/data'
import '../../styles/swagger.scss'
import Lazy from '../Lazy'
import { getResourcesAndLibraries } from '../../util/ui/getResourcesAndLibraries'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })


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
      metadata_resolver: null,
      enrichment_resolver: null,
			resource_libraries: {},
      error_message: null,
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



  metadata_search = (props) => {
    const reverse_preferred = Object.entries(this.props.ui_values.preferred_name).reduce((names,[k,v])=>{
      names[v] = k
      return names
    }, {})
    const search_props = this.props.ui_values.nav.MetadataSearch.props
    const model = reverse_preferred[props.match.params.model]
    if (search_props.model_tabs.indexOf(model)===-1) return <Redirect to='/not-found'/>
    
    return (
      <MetadataSearch schemas={this.props.schemas}
                    resource_libraries={this.state.resource_libraries}
                    preferred_name={this.props.ui_values.preferred_name}
                    preferred_name_singular={this.props.ui_values.preferred_name_singular}
                    model={model}
                    model_tabs={search_props.model_tabs}
                    label={props.match.params.label}
                    filter_props={(this.props.search_filters || {})[model] || []}
                    nav={this.props.ui_values.nav}
                    search_examples={(search_props.examples || {})[model] || []}
                    resolver={this.state.metadata_resolver}
                    placeholder={search_props.placeholder}
                    {...props}
      />
    )
  }

  signature_search = (props) => {
    const {nav,
      preferred_name,
      preferred_name_singular,
      resource_order,
      library_priority,
      results_title} = this.props.ui_values
    const reverse_preferred = Object.entries(preferred_name).reduce((names,[k,v])=>{
      names[v] = k
      return names
    }, {})
    let model = 'resources'
    if (props.match.params.model){
      model = reverse_preferred[props.match.params.model]
      if (model!=='resources') return <Redirect to='/not-found'/>
    }
    if (["Overlap", "Rank"].indexOf(props.match.params.type)===-1) return <Redirect to='/not-found'/>
    const search_props = nav.SignatureSearch.props.types[props.match.params.type]
    const enrichment_tabs = {}
    for (const [k,v] of Object.entries(nav.SignatureSearch.props.types)){
      if (v.active){
        enrichment_tabs[k] = {
          label: v.switch,
          href: `#${nav.SignatureSearch.endpoint}/${k}`,
          type: k,
          icon: v.icon,
        }
        if (v.placeholder) enrichment_tabs[k].placeholder = v.placeholder
        if (v.up_placeholder) enrichment_tabs[k].up_placeholder = v.up_placeholder
        if (v.down_placeholder) enrichment_tabs[k].down_placeholder = v.down_placeholder
      }
    }
    return (
      <SignatureSearch schemas={this.props.schemas}
                    resource_libraries={this.state.resource_libraries}
                    preferred_name={preferred_name}
                    preferred_name_singular={preferred_name_singular}
                    label={props.match.params.label}
                    nav={nav}
                    examples={search_props.examples}
                    resource_order={resource_order}
                    resolver={this.state.enrichment_resolver}
                    model={model}
                    enrichment_tabs={enrichment_tabs}
                    library_priority={library_priority}
                    results_title={results_title}
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
                    resource_libraries={this.state.resource_libraries}
                    preferred_name={this.props.ui_values.preferred_name}
                    preferred_name_singular={this.props.ui_values.preferred_name_singular}
                    id={id}
                    model={model}
                    nav={this.props.ui_values.nav}
                    label={props.match.params.label}
                    metadata_resolver={this.state.metadata_resolver}
                    enrichment_resolver={this.state.enrichment_resolver}
                    library_priority={this.props.ui_values.library_priority}
                    results_title={this.props.ui_values.results_title}
                    {...props}
      />
    )
  }

  about = (props) => {
    return (
      <About {...props} ui_values={this.props.ui_values} stats={this.props.serverSideProps}/>
    )
  }

  reportError = (error_message) => {
    this.setState({
      error_message
    })
  }

  closeError = () => {
    this.setState({
      error_message: null
    })
  }
  
  componentDidMount = async () => {
		const schemas = this.props.schemas
		const metadata_resolver = new DataResolver()
    const enrichment_resolver = new DataResolver()
    await getResourcesAndLibraries(schemas, enrichment_resolver)
		const resource_libraries = await getResourcesAndLibraries(schemas, metadata_resolver)
		this.setState({
      metadata_resolver,
      enrichment_resolver,
			resource_libraries,
		})
	}

  render = () => {
    if (this.state.metadata_resolver === null) {
      return <CircularProgress />
    }
    const extra_nav = []
    for (const nav of this.props.ui_values.extraNav){
      if (nav.type !== 'external') {
        extra_nav.push(
          <Route
            key={nav.endpoint}
            path={nav.endpoint}
            exact
            component={(props)=><IFramePage {...props} {...nav}/>}
          />
        )
      }
    }
    const {nav, preferred_name} = this.props.ui_values
    const landing_endpoint = nav.MetadataSearch.landing ? nav.MetadataSearch.endpoint : nav.SignatureSearch.endpoint
    return (
      <Base location={this.props.location}
        // footer_type={this.props.ui_values.footer_type}
        // github={this.props.ui_values.github}
        // github_issues={this.props.ui_values.github_issues}
        ui_values={this.props.ui_values}
        theme={this.props.theme}
      >
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.error_message !== null}
          autoHideDuration={6000}
          onClose={this.closeError}
        >
          <SigcomSnackbar
            onClose={this.closeError}
            message={this.state.error_message}
          />
        </Snackbar>
        <Switch>
          {nav.MetadataSearch.active ?
            <Route
              path={nav.MetadataSearch.endpoint || '/MetadataSearch'}
              exact
              component={()=><Redirect to={`${nav.MetadataSearch.endpoint}/${preferred_name[nav.MetadataSearch.props.entry_model]}`} />}
            />
            : null
          }
          {nav.MetadataSearch.active ?
            <Route
              path={`${nav.MetadataSearch.endpoint || '/MetadataSearch'}/:model`}
              component={this.metadata_search}
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={nav.SignatureSearch.endpoint || '/SignatureSearch'}
              exact
              component={(props) => {
                return <Redirect to={`${nav.SignatureSearch.endpoint || '/SignatureSearch'}${nav.SignatureSearch.props.types.Overlap.active ? '/Overlap' : '/Rank'}`} />
              }}
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`${nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type`}
              exact
              component={this.signature_search}
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`${nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id`}
              component={this.signature_search}
              exact
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`${nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id/:model`}
              component={this.signature_search}
              exact
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`${nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:enrichment_id/:model/:id`}
              component={this.signature_search}
              exact
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`/Enrichment/:type/:enrichment_id/:model/:id`}
              component={this.metadata_pages}
              exact
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`/Enrichment/:type/:enrichment_id`}
              component={(props)=>{
                const {type, enrichment_id} = props.match.params
                return <Redirect to={`${nav.SignatureSearch.endpoint}/${type}/${enrichment_id}`}/>
              }}
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`/Enrichment/:type`}
              component={(props)=>{
                const {type, enrichment_id} = props.match.params
                return <Redirect to={`${nav.SignatureSearch.endpoint}/${type}`}/>
              }}
            />
            : null
          }
          {nav.SignatureSearch.active ?
            <Route
              path={`/Enrichment`}
              component={(props)=>{
                const {type, enrichment_id} = props.match.params
                return <Redirect to={`${nav.SignatureSearch.endpoint}/Overlap`}/>
              }}
            />
            : null
          }
          {nav.Resources.active ?
            <Route
              path={`${nav.Resources.endpoint || '/Resources'}`}
              exact
              component={this.resources}
            /> : null
          }
          <Route
            path={'/About'}
            component={this.about}
          />
          <Route
            path="/:model/:id"
            component={this.metadata_pages}
          />
          <Route
            path="/:model/:id/:label"
            component={this.metadata_pages}
          />
          <Route
            path={`${nav.API.endpoint || '/API'}`}
            component={this.api}
          />
          <Route
            path={"/Terms"}
            component={(props)=><Terms {...props} terms={this.props.ui_values.terms}/>}
          />
          {extra_nav}
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
            component={(props)=>{
              return <Redirect to={landing_endpoint} />
            }}
          />
        </Switch>
      </Base>
    )
  }
}

export default Home
