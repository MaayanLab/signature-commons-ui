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

import Base from '../../components/Base'
import About from '../../components/About'
import Landing from '../Landing'
import Resources from '../Resources'
import MetadataSearch from '../MetadataSearch'
import SignatureSearch from '../SignatureSearch'
import Pages from '../Pages'
import Help from '../Help'

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
    marginRight: theme.spacing.unit,
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
    return (
      <Pages {...props}/>
    )
  }

  about = (props) => {
    return (
      <About {...props} ui_values={this.props.ui_values}/>
    )
  }

  help = (props) => {
    return (
      <Help {...props} ui_values={this.props.ui_values}/>
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
                component={this.landing}
              />
              : null
            }
            {this.props.ui_values.nav.MetadataSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.MetadataSearch.endpoint || '/MetadataSearch'}/:table`}
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
                component={this.landing}
              />
             : null
            }
            {this.props.ui_values.nav.SignatureSearch.active ?
              <Route
                path={`${this.props.ui_values.nav.SignatureSearch.endpoint || '/SignatureSearch'}/:type/:id`}
                component={this.signature_search}
              />
             : null
            }
            {this.props.ui_values.nav.Resources.active ?
              <Route
                path={`${this.props.ui_values.nav.Resources.endpoint || '/Resources'}`}
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
              path={'/Help'}
              component={this.help}
            />
            <Route
              path="/:table/:id"
              component={this.pages}
            />
            <Route
              path={`${this.props.ui_values.nav.API.endpoint || '/API'}`}
              component={this.api}
            />
            <Route
              path="/not-found"
              component={(props) => {
                return <div />
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
