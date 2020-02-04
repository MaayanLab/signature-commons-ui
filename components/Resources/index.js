import React from 'react'
import ResourcePage from './ResourcePage'
import ResourceList from './ResourceList'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetch_meta } from '../../util/fetch/meta'
import { get_schemas } from '../../util/helper/fetch_methods'
import { makeTemplate } from '../../util/makeTemplate'
import { findMatchedSchema } from '../../util/objectMatch'
import CircularProgress from '@material-ui/core/CircularProgress'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.serverSideProps,
    ui_values: state.ui_values,
    ResourcesNav: state.ui_values.nav.Resources || {},
  }
}

export const get_schema_props= (item, schemas) => {
  const schema = findMatchedSchema(item, schemas)
  const response = {schema}
  for (const prop of Object.values(schema.properties)){
    if (prop.name){
      response["name_prop"] = prop.text
    }
    if (prop.icon){
      response["icon_prop"] = prop.src
    }
    if (prop.description){
      response["description_prop"] = prop.text
    }
  }
  if (response["name_prop"] === undefined) prop.name = "${id}"
  return {...response}
}

export const get_resources_and_libraries = async(fetch_libraries=true) => {
  const { response: resources } = await fetch_meta({
    endpoint: `/resources`,
  })
  if (fetch_libraries){
    const { response: libraries } = await fetch_meta({
      endpoint: `/libraries`,
      body: {
        filter: {
          where: {
            resource: { eq: null}
          }
        }
      }
    })
    return {response: [...resources, ...libraries]}
  }else {
    return {response: resources}
  }
}

class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: null,
    }
  }

  componentDidMount = async () => {
    const schemas = await get_schemas()
    const { response } = await get_resources_and_libraries()
    const resources = response.reduce((acc, resource) => {
      const {name_prop} = get_schema_props(resource, schemas)
      let name = makeTemplate(name_prop, resource)
      if (name === 'undefined') name = resource.id
      acc[name] = resource
      return acc
    }, {})
    this.setState({
      resources,
      schemas
    })
  }


  resource_list = (props) => (
    <ResourceList
      {...props}
      {...this.state}
    />
  )

  resource_page = (props) => {
    return (<ResourcePage
      cart={this.props.cart}
      {...props}
      {...this.state}
    />)
  }

  render() {
    if (this.state.resources === null) {
      return <CircularProgress />
    } else {
      return (
        <Switch>
          <Route exact path={`${this.props.ResourcesNav.endpoint || '/Resources'}`}component={this.resource_list} />
          <Route path={`${this.props.ResourcesNav.endpoint || '/Resources'}/:resource`} component={this.resource_page} />
        </Switch>
      )
    }
  }
}

export default connect(mapStateToProps)(Resources)
