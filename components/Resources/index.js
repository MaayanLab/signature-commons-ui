import React from 'react'
import { get_library_resources } from './resources'
import ResourcePage from './ResourcePage'
import ResourceList from './ResourceList'
import { Route, Switch } from 'react-router-dom'
import NProgress from 'nprogress'


export default class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: {},
      selected: null,
    }
  }

  async componentDidMount() {
    NProgress.start()
    this.setState({ ...(await get_library_resources()) })
    NProgress.done()
  }

  resource_list = (props) => (
    <ResourceList
      resources={Object.values(this.state.resources)}
      {...props}
    />
  )

  resource_page = (props) => {
    const resource = this.state.resources[props.match.params.resource.replace(/_/g, ' ')]
    return resource === undefined ? null : (
      <ResourcePage
        resource={resource}
        cart={this.props.cart}
        {...props}
      />
    )
  }

  render() {
    return (
      <Switch>
        <Route exact path="/Resources" component={this.resource_list} />
        <Route path="/Resources/:resource" component={this.resource_page} />
      </Switch>
    )
  }
}
