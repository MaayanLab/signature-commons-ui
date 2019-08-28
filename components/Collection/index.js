import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { landingStyle } from '../../styles/jss/theme.js'
import Library from './Library'


export default withStyles(landingStyle)(class Collection extends React.Component {
  library = (props) => (
    <Library
      {...this.props}
      {...props}
    />
  )

  library_redirect = () => (
    <Redirect
      to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
    />
  )

  render() {
    return (
      <div className="row">
        <Switch>
          <Route exact path="/Library" render={this.library_redirect} />
          <Route path="/Library/:id/" component={this.library} />
        </Switch>
      </div>
    )
  }
})
