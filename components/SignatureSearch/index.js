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


function parse_entities(input) {
  return Set(input.toUpperCase().split(/[ \t\r\n;]+/).reduce(
    (lines, line) => {
      const parsed = /^(.+?)(,(.+))?$/.exec(line)
      if (parsed !== null)
        return [...lines, parsed[1]]
      return lines
    }, []
  ))
}

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
    console.log("submitting")
    NProgress.start()
    // TODO: register signature with metadata api


    let controller = this.state.controller
    if (controller !== null) controller.abort()
    else controller = new AbortController()
    this.setState(() => ({
      controller, input
    }), async () => {
      if (input.type === 'Overlap') {
        const unresolved_entities = parse_entities(input.geneset)
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0) {
          M.toast({
            html: `The entities: ${[...mismatched].join(', ')} were dropped because they could not be recognized`,
            classes: 'rounded',
            displayLength: 4000,
          })
        }

        const resolved_entities = [...(unresolved_entities.subtract(mismatched))].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify(resolved_entities))

        const results = await query_overlap({
          ...this.state,
          input: {
            entities: resolved_entities,
          }
        })
        this.setState(() => ({ ...results, mismatched }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      } else if (input.type === 'Rank') {
        const unresolved_up_entities = parse_entities(input.up_geneset)
        const unresolved_down_entities = parse_entities(input.down_geneset)
        const unresolved_entities = unresolved_up_entities.union(unresolved_down_entities)
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0) {
          M.toast({
            html: `The entities: ${[...mismatched].join(', ')} were dropped because they could not be recognized`,
            classes: 'rounded',
            displayLength: 4000,
          })
        }

        const resolved_up_entities = [...unresolved_up_entities.subtract(mismatched)].map((entity) => entities[entity])
        const resolved_down_entities = [...unresolved_down_entities.subtract(mismatched)].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify([resolved_up_entities, resolved_down_entities]))

        const results = await query_rank({
          ...this.state,
          input: {
            up_entities: resolved_up_entities,
            down_entities: resolved_down_entities,
          }
        })
        this.setState(() => ({ ...results, mismatched }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      }

    })
  }

  geneset_searchbox = (props) => {
    console.log(props)
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
