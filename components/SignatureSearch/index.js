import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import ResourceFilters from './ResourceFilters'
import LibraryResults from './LibraryResults'
import { connect } from 'react-redux'
import { findSignaturesFromId } from '../../util/redux/actions'
import { get_schemas } from '../../util/helper/fetch_methods'
import { fetch_meta } from '../../util/fetch/meta'
import { get_resources_and_libraries } from '../Resources'
import CircularProgress from '@material-ui/core/CircularProgress'

const mapStateToProps = (state) => {
  return {
    ...state.signature_result,
    ui_values: state.ui_values,
    input: state.signature_input,
    loading: state.loading_signature,
    SignatureSearchNav: state.ui_values.nav.SignatureSearch || {},
  }
}

function mapDispatchToProps(dispatch) {
  return {
    search: (type, id) =>
      dispatch(findSignaturesFromId(type, id)),
  }
}

class SignatureSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      controller: null,
      resources: null,
    }
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0)

    const schemas = await get_schemas()
    const { response: resources } = await get_resources_and_libraries(this.props.ui_values.showNonResource)
    if (this.props.input === undefined || this.props.match.params.id !== this.props.input.id) {
      this.props.search(this.props.match.params.type, this.props.match.params.id)
    }
    this.setState({
      schemas,
      resources,
    })
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.loading === false && this.props.loading === false) {
      if (prevProps.match.params.id !== this.props.match.params.id){
        if (this.props.input === undefined || this.props.match.params.id !== this.props.input.id) {
          this.props.search(this.props.match.params.type, this.props.match.params.id)
        }
      }
    }
  }


  resource_filters = (props) => (
    <ResourceFilters
      resources={this.props.resources || []}
      resource_signatures={this.props.resource_signatures || {}}
      ui_values={this.props.ui_values}
      input={this.props.input}
      submit={this.props.submit}
      signature_type={this.props.signature_type}
      loading={this.props.loading}
      {...props}
      {...this.state}
    />
  )

  library_results = (props) => {
    if (this.props.resource_signatures === undefined) return <CircularProgress />
    return(
    <LibraryResults
      results={
        (((this.props.resource_signatures || {})[props.match.params.resource.replace(/_/g, ' ')] || {}).libraries || []).map(
            (lib) => this.props.library_signatures[lib]
        )
      }
      signature_keys={this.props.signature_keys}
      {...this.props}
      {...this.state}
      {...props}
    />
  )}

  render_signature_search = () => {
    this.props.handleChange({}, 'signature', true)
    return <Redirect to="/" />
  }

  render_signature_search_type = (props) => {
    const type = props.match.params.type
    this.props.changeSignatureType(type)
    this.props.handleChange({}, 'signature', true)
    return <Redirect to="/" />
  }

  render = () => {
    if (this.state.resources === null) {
      return <CircularProgress />
    }
    return (
      <div className="row">
        <Switch>
          <Route exact path={`${this.props.SignatureSearchNav.endpoint || '/SignatureSearch'}`} render={this.render_signature_search} />
          <Route path={`${this.props.SignatureSearchNav.endpoint || '/SignatureSearch'}/:type/:input_signature/:resource`} component={this.library_results} />
          <Route path={`${this.props.SignatureSearchNav.endpoint || '/SignatureSearch'}/:type/:input_signature`} component={this.resource_filters} />
          <Route path={`${this.props.SignatureSearchNav.endpoint || '/SignatureSearch'}/:type`} render={this.render_signature_search_type} />
        </Switch>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignatureSearch)
