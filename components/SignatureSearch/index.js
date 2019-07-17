import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import GenesetSearchBox from './GenesetSearchBox'
import ResourceFilters from './ResourceFilters'
import LibraryResults from './LibraryResults'

export default class SignatureSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      input: {},
      controller: null,
    }
  }


  geneset_searchbox = (props) => {
    if (this.props.location.state) {
      return (<div />)
    } else {
      return (
        <GenesetSearchBox
          input={this.props.input}
          onSubmit={this.props.submit}
          ui_values={this.props.ui_values}
          changeSignatureType={this.props.changeSignatureType}
          updateSignatureInput={this.props.updateSignatureInput}
          {...props}
        />
      )
    }
  }

  resource_filters = (props) => (
    <ResourceFilters
      resources={Object.values(this.props.resources || {})}
      resource_signatures={this.props.resource_signatures || {}}
      {...props}
    />
  )

  library_results = (props) => (
    <LibraryResults
      results={
        (((this.props.resource_signatures || {})[props.match.params.resource.replace('_', ' ')] || {}).libraries || []).map(
            (lib) => this.props.library_signatures[lib]
        )
      }
      signature_keys={this.props.signature_keys}
      schemas={this.props.schemas}
      {...props}
    />
  )

  render() {
    return (
      <div className="row">
        <Switch>
          <Route exact path="/SignatureSearch" render={() => {
            this.props.handleChange({}, 'signature', true)
            return (<Redirect to="/" />)
          }}
          />
          <Route path="/SignatureSearch/:type/:input_signature/:resource" component={this.library_results} />
          <Route path="/SignatureSearch/:type/:input_signature" component={this.resource_filters} />
          <Route path="/SignatureSearch/:type" render={(props) => {
            const type = props.match.params.type
            this.props.changeSignatureType(type)
            this.props.handleChange({}, 'signature', true)
            return (<Redirect to="/" />)
          }} />
        </Switch>
      </div>
    )
  }
}
