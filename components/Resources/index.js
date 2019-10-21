import React from 'react'
import ResourcePage from './ResourcePage'
import ResourceList from './ResourceList'
import { Route, Switch } from 'react-router-dom'
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => {
  return { 
    ...state.serverSideProps,
    ResourcesNav: state.serverSideProps.ui_values.nav.Resources || {}
  }
};

class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selected: null,
    }
  }

  resource_list = (props) => (
    <ResourceList
      {...props}
    />
  )

  resource_page = (props) => {
    return(<ResourcePage
      cart={this.props.cart}
      ui_values={this.props.ui_values}
      schemas={this.props.schemas}
      {...props}
    />)
  }

  render() {
    return (
      <Switch>
        <Route exact path={`${this.props.ResourcesNav.endpoint || '/Resources'}`}component={this.resource_list} />
        <Route path={`${this.props.ResourcesNav.endpoint || '/Resources'}/:resource`} component={this.resource_page} />
      </Switch>
    )
  }
}

export default connect(mapStateToProps)(Resources)
