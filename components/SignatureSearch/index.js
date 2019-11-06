import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import ResourceFilters from './ResourceFilters'
import LibraryResults from './LibraryResults'
import { connect } from 'react-redux'
import { findSignaturesFromId } from '../../util/redux/actions'
import { findMatchedSchema } from '../../util/objectMatch'
import { get_schemas } from '../../util/helper/fetch_methods'
import { fetch_meta } from '../../util/fetch/meta'

import CircularProgress from '@material-ui/core/CircularProgress'

const mapStateToProps = (state) => {
  return {
    ...state.serverSideProps,
    ...state.signature_result,
    input: state.signature_input,
    loading: state.loading_signature,
    SignatureSearchNav: state.serverSideProps.ui_values.nav.SignatureSearch || {},
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
      input: {},
      controller: null,
      resources: null,
    }
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0)

    const schemas = await get_schemas()
    const { response: resources } = await fetch_meta({
      endpoint: `/resources`,
    })
    const schema = await findMatchedSchema(resources[0], schemas)
    const name_props = Object.values(schema.properties).filter((prop) => prop.name)
    const name_prop = name_props.length > 0 ? name_props[0].text : '${id}'
    const icon_props = Object.values(schema.properties).filter((prop) => prop.icon)
    const icon_prop = icon_props.length > 0 ? icon_props[0].src : '${id}'
    const description_props = Object.values(schema.properties).filter((prop) => prop.description)
    const description_prop = description_props.length > 0 ? description_props[0].text : '${id}'
    if (this.props.input === undefined || this.props.match.params.id !== this.props.input.id) {
      this.props.search(this.props.match.params.type, this.props.match.params.id)
    }
    this.setState({
      schemas,
      icon_prop,
      name_prop,
      description_prop,
      resources,
    })
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.loading === false && this.props.loading === false) {
      if (this.props.input === undefined || this.props.match.params.id !== this.props.input.id) {
        this.props.search(this.props.match.params.type, this.props.match.params.id)
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
    return(
    <LibraryResults
      results={
        (((this.props.resource_signatures || {})[props.match.params.resource.replace(/_/g, ' ')] || {}).libraries || []).map(
            (lib) => this.props.library_signatures[lib]
        )
      }
      signature_keys={this.props.signature_keys}
      schemas={this.props.schemas}
      {...props}
      {...this.state}
      {...this.props}
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
