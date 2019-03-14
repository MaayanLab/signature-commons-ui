import React from "react"
import { Switch, Route, Redirect } from 'react-router-dom'
import GenesetSearchBox from "./GenesetSearchBox";
import uuid5 from 'uuid5'
import NProgress from 'nprogress'
import { query } from "./query";
import { get_library_resources } from "../Resources/resources";
import ResourceFilters from "./ResourceFilters";
import LibraryResults from "./LibraryResults";

export default class SignatureSearch extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      input: {},
      controller: null,
    }
  }

  async componentDidMount() {
    NProgress.start()
    this.setState({...(await get_library_resources())})
    NProgress.done()
  }

  submit = (input) => {
    NProgress.start()
    // TODO: register signature with metadata api

    const signature_id = uuid5(JSON.stringify(input))
    console.log(input)

    let controller = this.state.controller
    if (controller !== null) controller.abort()
    else controller = new AbortController()
    this.setState(() => ({
      controller, input
    }), async () => {
      const results = await query(this.state)
      this.setState(() => ({ ...results }), () => NProgress.done())
      this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
    })
  }

  geneset_searchbox = (props) => (
    <GenesetSearchBox
      onSubmit={this.submit}
      {...props}
    />
  )

  resource_filters = (props) => (
    <ResourceFilters
      resources={Object.values(this.state.resources || {})}
      resource_signatures={this.state.resource_signatures || {}}
      {...props}
    />
  )

  library_results = (props) => (
    <LibraryResults
      results={
        (((this.state.resource_signatures || {})[props.match.params.resource.replace('_', ' ')] || {}).libraries || []).map(
          (lib) => this.state.library_signatures[lib]
        )
      }
      {...props}
    />
  )

  render() {
    return (
      <div className="row">
        <Switch>
          <Route exact path="/SignatureSearch" render={() => <Redirect to="/SignatureSearch/Overlap" />} />
          <Route path="/SignatureSearch/:type/:input_signature/:resource" component={this.library_results} />
          <Route path="/SignatureSearch/:type/:input_signature" component={this.resource_filters} />
          <Route path="/SignatureSearch/:type" component={this.geneset_searchbox} />
        </Switch>
      </div>
    )
  }
}
