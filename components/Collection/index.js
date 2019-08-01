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

  render(){
    return (
      <div className="row">
        <Switch>
          <Route exact path="/Library" render={() => {
            return (<Redirect to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`} />)
          }}
          />
          <Route path="/Library/:id/" component={this.library} />
        </Switch>
      </div>
    )
  }
})
