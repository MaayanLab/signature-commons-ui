import React from 'react'
import ResourcePage from './ResourcePage'
import ResourceList from './ResourceList'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetch_meta } from '../../util/fetch/meta'
import { get_schemas } from '../../util/helper/fetch_methods'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { findMatchedSchema } from '../../util/ui/objectMatch'
import CircularProgress from '@material-ui/core/CircularProgress'

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.serverSideProps,
    ui_values: state.ui_values,
    ResourcesNav: state.ui_values.nav.Resources || {},
  }
}

export const get_schema_props = (item, schemas) => {
  const schema = findMatchedSchema(item, schemas)
  const response = { schema }
  for (const prop of Object.values(schema.properties)) {
    if (prop.name) {
      response['name_prop'] = prop.text
    }
    if (prop.icon) {
      response['icon_prop'] = prop.src
    }
    if (prop.description) {
      response['description_prop'] = prop.text
    }
  }
  if (response['name_prop'] === undefined) prop.name = '${id}'
  return { ...response }
}

export const get_resources_and_libraries = async (fetch_libraries = true, limit = 50, skip = 0) => {
  const { response: resource_count } = await fetch_meta({
    endpoint: `/resources/count`,
    body: {
      where: {
        'meta.$hidden': { eq: null },
      },
    },
  })
  const { response: resources } = await fetch_meta({
    endpoint: `/resources`,
    body: {
      filter: {
        where: {
          'meta.$hidden': { eq: null },
        },
        limit,
        skip,
      },
    },
  })
  if (fetch_libraries || resource_count === 0) {
    const { response: library_count } = await fetch_meta({
      endpoint: `/libraries/count`,
      body: {
        where: {
          resource: { eq: null },
        },
      },
    })
    const { response: libraries } = await fetch_meta({
      endpoint: `/libraries`,
      body: {
        filter: {
          where: {
            resource: { eq: null },
          },
          limit,
          skip,
        },
      },
    })
    return {
      response: [...resources, ...libraries],
      count: resource_count.count + library_count.count,
    }
  } else {
    return {
      response: resources,
      count: resource_count.count,
    }
  }
}

class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: null,
      limit: 50,
      skip: 0,
    }
  }

  componentDidMount = async () => {
    const schemas = await get_schemas()
    const { limit, skip } = this.state
    const { response, count } = await get_resources_and_libraries(this.props.ui_values.showNonResource, limit, skip)
    if (response.length === 0) {
      this.setState({
        resources: [],
      })
    } else {
      const resources = response.reduce((acc, resource) => {
        const { name_prop } = get_schema_props(resource, schemas)
        let name = makeTemplate(name_prop, resource)
        if (name === 'undefined') name = resource.id
        acc[name] = resource
        return acc
      }, {})
      this.setState({
        resources,
        schemas,
        count,
      })
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { limit, skip, schemas } = this.state
    if (prevState.limit !== limit || prevState.skip !== skip) {
      const { response } = await get_resources_and_libraries(this.props.ui_values.showNonResource, limit, skip)
      if (response.length > 0) {
        const resources = response.reduce((acc, resource) => {
          const { name_prop } = get_schema_props(resource, schemas)
          let name = makeTemplate(name_prop, resource)
          if (name === 'undefined') name = resource.id
          acc[name] = resource
          return acc
        }, {})
        console.log(resources)
        this.setState((prevState) => ({
          resources: { ...prevState.resources, ...resources },
        }))
      }
    }
  }

  get_more_resources = () => {
    this.setState((prevState) => ({
      skip: prevState.skip + prevState.limit,
    }))
  }


  resource_list = (props) => (
    <ResourceList
      {...props}
      {...this.state}
      onClickMore={this.get_more_resources}
      total_count={this.state.count}
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
      return <CircularProgress color="primary" />
    } else {
      return (
        <Switch>
          <Route exact path={`${this.props.ResourcesNav.endpoint || '/Resources'}`}component={this.resource_list} />
          {/* <Route path={`${this.props.ResourcesNav.endpoint || '/Resources'}/:resource`} component={this.resource_page} /> */}
        </Switch>
      )
    }
  }
}

export default connect(mapStateToProps)(Resources)
