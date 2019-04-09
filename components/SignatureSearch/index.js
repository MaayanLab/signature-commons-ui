import React from "react"
import { Switch, Route, Redirect } from 'react-router-dom'
import GenesetSearchBox from "./GenesetSearchBox";
import uuid5 from 'uuid5'
import NProgress from 'nprogress'
import { query_overlap, query_rank } from "./query";
import { get_library_resources } from "../Resources/resources";
import ResourceFilters from "./ResourceFilters";
import LibraryResults from "./LibraryResults";
import { resolve_entities } from "./resolve";
import { Set } from 'immutable'
import { call } from '../../util/call'


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
    if(this.props.location.state){
      this.setState({
        input: this.props.location.state.input
      },()=>{
        this.submit(this.state.input)
      })
    }
    NProgress.done()
  }

  submit = (input) => {
    NProgress.start()
    // TODO: register signature with metadata api


    let controller = this.state.controller
    if (controller !== null) controller.abort()
    else controller = new AbortController()
    this.setState(() => ({
      controller, input
    }), async () => {
      if (input.type === 'Overlap') {
        const unresolved_entities = Set(input.geneset.toUpperCase().split(/[ \t\n;]+/).map(
            // TODO: handle weights
          (line) => /^(.+?)(,(.+))?$/.exec(line)[1]
        ))
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0)
          console.warn('mismatched entities', [...mismatched])

        const resolved_entities = [...unresolved_entities].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify(resolved_entities))

        const results = await query_overlap({
          ...this.state,
          input: {
            entities: resolved_entities,
          }
        })
        this.setState(() => ({ ...results }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      } else if (input.type === 'Rank') {
        const unresolved_up_entities = Set(input.up_geneset.toUpperCase().split(/[ \t\n;]+/).map(
            // TODO: handle weights
          (line) => /^(.+?)(,(.+))?$/.exec(line)[1]
        ))
        const unresolved_down_entities = Set(input.down_geneset.toUpperCase().split(/[ \t\n;]+/).map(
            // TODO: handle weights
          (line) => /^(.+?)(,(.+))?$/.exec(line)[1]
        ))
        const unresolved_entities = unresolved_up_entities.union(unresolved_down_entities)
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0)
          console.warn('mismatched entities', [...mismatched])

        const resolved_up_entities = [...unresolved_up_entities].map((entity) => entities[entity])
        const resolved_down_entities = [...unresolved_down_entities].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify([resolved_up_entities, resolved_down_entities]))
  
        const results = await query_rank({
          ...this.state,
          input: {
            up_entities: resolved_up_entities,
            down_entities: resolved_down_entities,
          }
        })
        this.setState(() => ({ ...results }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      }

    })
  }

  geneset_searchbox = (props) => {
    if(this.props.location.state){
      return(<div />)
    }else{
      return(
        <GenesetSearchBox
          input={this.state.input}
          onSubmit={this.submit}
          {...props}
        />
        )
    }
  }

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
