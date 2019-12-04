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

class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: null,
    }
  }

  componentDidMount = async () => {
    const schemas = await get_schemas()
    const { response } = await fetch_meta({
      endpoint: `/resources`,
    })
    const schema = await findMatchedSchema(response[0], schemas)
    const name_props = Object.values(schema.properties).filter((prop) => prop.name)
    const name_prop = name_props.length > 0 ? name_props[0].text : '${id}'
    const icon_props = Object.values(schema.properties).filter((prop) => prop.icon)
    const icon_prop = icon_props.length > 0 ? icon_props[0].src : '${id}'
    const description_props = Object.values(schema.properties).filter((prop) => prop.description)
    const description_prop = description_props.length > 0 ? description_props[0].text : '${id}'
    const resources = response.reduce((acc, resource) => {
      let name = makeTemplate(name_prop, resource)
      if (name === 'undefined') name = resource.id
      acc[name] = resource
      return acc
    }, {})
    this.setState({
      resources,
      schemas,
      name_prop,
      icon_prop,
      description_prop,
    })
  }


  resource_list = (props) => (
    <ResourceList
      {...props}
      {...this.state}
    />
  )

  resource_page = (props) => {
    console.log(this.state.resources)
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
