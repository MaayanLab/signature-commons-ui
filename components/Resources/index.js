import React from 'react'
import ResourcePage from './ResourcePage'
import ResourceList from './ResourceList'
import { Route, Switch } from 'react-router-dom'

export default class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selected: null,
    }
  }

  resource_list = (props) => (
    <ResourceList
      resources={Object.values(this.props.resources)}
      ui_content={this.props.ui_content}
      {...props}
    />
  )

  resource_page = (props) => {
    const resource = this.props.resources[props.match.params.resource.replace(/_/g, ' ')]
    return resource === undefined ? null : (
      <ResourcePage
        resource={resource}
        cart={this.props.cart}
        ui_content={this.props.ui_content}
        schemas={this.props.schemas}
        {...props}
      />
    )
  }

  render() {
    return (
      <Switch>
        <Route exact path={`/${this.props.ui_content.content.change_resource || 'Resources'}`}component={this.resource_list} />
        <Route path={`/${this.props.ui_content.content.change_resource || 'Resources'}/:resource`} component={this.resource_page} />
      </Switch>
    )
  }
}
