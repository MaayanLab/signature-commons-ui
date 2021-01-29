import React from 'react'
import {build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import { get_filter, resolve_ids } from './utils'
import PropTypes from 'prop-types'
import {SignatureSearchComponent} from './SignatureSearchComponent'
import Badge from '@material-ui/core/Badge';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

export default class SignatureSearch extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			entries: null,
			input: null,
			model: "resources",
			searching: false,
			resolving: false,
			query: {},
			error: null
		}
	}

	search_resources = async (searching=null) => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {schemas} = this.props
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const resolved_query = resolve_ids({
				query,
				model: this.state.model,
				...this.props.resource_libraries
			})
			const where = build_where(resolved_query)
			const {limit=10, skip=0, order} = query
			// const skip = limit*page
			const filter = {
				limit, skip, order
			}
			if (where) filter["where"] = where
			const {entries: results, count} = await this.props.resolver.filter_metadata({
				model: this.state.model,
				filter,
			})
			
			const entries = []
			for (const c of Object.values(results)){
				const entry = await c.entry()
				const e = labelGenerator(await entry,
					schemas,
					"#" + this.props.preferred_name[this.state.model] +"/")
				entries.push(e)
			}
			
			this.setState({
				count,
				entries,
				page: skip/limit,
				perPage: limit,
				query,
				searching: searching !== null ? searching : this.props.match.params.enrichment_id!==undefined,
				paginate: false,
			})
		} catch (error) {
			console.error(error)
		}
	}

	handleTabChange = (v) => {
		this.props.history.push({
			pathname: v.href,
		})
	}

	resolve_entities = async () => {
		try {
			const {schemas} = this.props
			const input = {...this.state.input}
			
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			
			const entities_labels = []
			for (const entities of Object.values(input)){
				for (const i of Object.values(entities)){
					if (i.type === "loading"){
						entities_labels.push(i.label)
					}
				}
			}
			const or = []
			for (const label of entities_labels){
				for (const t of [...this.state.titles, ...this.state.synonyms]){
					or.push({[t]: label})
				}
			}
			const filter = {
				where: {
					or
				}
			}
			const {entries: results} = await this.props.resolver.filter_metadata({
				model: "entities",
				filter,
			})
			
			for (const c of Object.values(results)){
				const entry = await c.entry()
				const e = labelGenerator(await entry,
					schemas)
				const label = e.info.name.text
				for (const field of Object.keys(input)){
					if (input[field][label]!==undefined){
						input[field][label] = {
							label,
							type: "valid",
							id: [...(input[field][label].id || []), entry.id]
						}
					} else {
						const synonyms = e.info.synonyms
						for (const syn of synonyms){
							if (input[field][syn]!==undefined){
								input[field][syn] = {
									label: syn,
									type: "suggestions",
									suggestions: [...(input[field][syn].suggestions || []), {
										id: [e.data.id],
										label,
										type: "valid"
									}]
								}
							}
						}
					}		
				}
			}
			for (const [field, entities] of Object.entries(input)){
				for (const [k,v] of Object.entries(entities)){
					if (v.type==="loading"){
						input[field][k].type = "invalid"
					}
				}
			}
			
			this.setState({
				input,
				resolving: false,
			})
		} catch (error) {
			console.error(error)
		}
	}
	
	onAddEntity = (value, field) => {
		this.setState(prevState=>{
			const {input} = prevState
			for (const v of value.trim().split(/[\t\r\n;]+/)){
				input[field][v] = {
					label: v,
					type: "loading"
				}
			}
			return({
				field,
				resolving: true
			})
		}, () => this.resolve_entities())
	  }

	onDeleteEntity = (value, field) => {
		this.setState(prevState=>{
			const {[value.label]:popped, ...entities} = prevState.input[field]
			const input = {
				...prevState.input,
				[field]: {
					...entities
				}
			}
			return {
				input, 
			}
		})
	  }

	onSuggestionClickEntity = (value, selected, field) => {
		this.setState(prevState=>{
			const {[value.label]:popped, ...entities} = prevState.input[field]
			const input = {
				...prevState.input,
				[field]: {
					...entities
				}
			}
			input[field][selected.label] = selected
			return {
				input, 
			}
		})
	}

	badge = (props) => {
		return <Badge badgeContent={props.score} color="error"/>
	}

	get_signature_entities = async (signature_id) => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {resolved_entries} = await this.props.resolver.resolve_entries({model: "signatures", entries: [signature_id]})
			const signature = resolved_entries[signature_id]
			if (signature === undefined) return null
			else {
				const children = await signature.children({limit: 0})
				const input_entities = []
				const query_entities = []
				for (const c of children.entities){
					const entry = labelGenerator(c, this.props.schemas)
					query_entities.push(c.id)
					input_entities.push({
						label: entry.info.name.text,
						id: [c.id],
						type: "valid"
					})
				}
				const input = {
					entities: input_entities
				}
				const query = {
					entities: query_entities,
					signature_id,
					input
				}
				this.setState({input})
				return query
				
			}
		} catch (error) {
			console.error(error)
		}
			
	}
	
	get_enrichment = async (enrichment_id) => {
		let enrichment = this.props.resolver.get_enrichment(enrichment_id)
		if (enrichment === undefined){
			const query = await this.get_signature_entities(enrichment_id)
			// check if enrichment id is a signature instead
			if (query === null) {
				const input = {}
				if (this.props.match.params.type === "Overlap"){
					input.entities = {}
				} else {
					input.up_entities = {}
					input.down_entities = {}
				}
				this.setState({
					error: "Invalid signature",
					input,
				}, ()=>this.search_resources(false))
				return null
			}
			else {
				const {entities, signature_id, input} = query
				enrichment = await this.enrichment({entities, signature_id, input, input_type: "set"})
			}
		}
		return enrichment
	}

	process_enrichment = async (enrichment) => {
		try {
			const { entries } = enrichment
			const {resolved_entries: signatures} = await this.props.resolver.resolve_entries({model: "signatures", entries})
			const libids = []
			for (const e of Object.values(signatures)){
				libids.push((await e.entry()).library)
			} 
			const {resolved_entries: libraries} = await this.props.resolver.resolve_entries({model: "libraries", entries: libids})
			const libraries_count = {}
			const libraries_children = {}
			const resources = {}
			const resources_count = {}
			const resources_children = {}
			
			let unresolved_entitites = []
			for (const unresolved_entry of entries ) {
				const {overlap, ...scores} = unresolved_entry.scores
				unresolved_entitites = [...unresolved_entitites, ...overlap]
			}
			const {resolved_entries: entities} = await this.props.resolver.resolve_entries({model: "entities", entries: unresolved_entitites})
			
			for (const unresolved_entry of entries ) {
				if (signatures[unresolved_entry.id]!==undefined){
					const signature = signatures[unresolved_entry.id]
					const {overlap, ...scores} = unresolved_entry.scores
					signature.update_entry({
						id: unresolved_entry.id,
						scores
					})
					await signature.set_children(overlap)
					signatures[signature.id] = signature
					
					// Get Parents for counting
					const library = await signature.parent_object()
					const resource = await library.parent_object()

					if (resources[resource.id] === undefined) resources[resource.id] = resource

					if (libraries_count[library.id]===undefined) libraries_count[library.id]={"Results": 0}
					if (resources_count[resource.id]===undefined) resources_count[resource.id]={"Results": 0}

					if (libraries_children[library.id]===undefined) libraries_children[library.id]=[]
					if (resources_children[resource.id]===undefined) resources_children[resource.id]=[]
					libraries_children[library.id].push(signature)
					resources_children[resource.id].push(library)

					libraries_count[library.id].Results = libraries_count[library.id].Results + 1
					library.update_entry({
						score: libraries_count[library.id]
					})
					resources_count[resource.id].Results = resources_count[resource.id].Results + 1
					resource.update_entry({
						score: resources_count[resource.id]
					})
					libraries[library.id] = library
					resources[resource.id] = resource
				}
			}
			for (const [id, children] of Object.entries(resources_children)){
				const resource = resources[id]
				await resource.set_children(children)
			}
			for (const [id, children] of Object.entries(libraries_children)){
				const library = libraries[id]
				await library.set_children(children)
			}
			const {limit=10, skip=0} = this.state.query
			const resource_entries = []
			for (const r of Object.values(resources)){
				resource_entries.push(await r.entry())
			}
			const sorted_entries = resource_entries.sort((a,b)=>b.score.Results - a.score.Results)
			const new_entries = []
			for (const entry of sorted_entries){
				const e = labelGenerator(entry,
					this.props.schemas,
					`#${this.props.location.pathname}/${this.props.preferred_name.resources}/`)
				if (entry.score !== undefined && entry.score.Results !== undefined){
					e["RightComponents"] = [
						{
							component: this.badge,
							props: {
								score: entry.score.Results,
								GridProps: {
									style: {
										textAlign: "right",
										marginRight: 5
									}
								}
							}
						}
					]
				}	
				new_entries.push(e)
			}
			let input = enrichment.input
			if (input === undefined){
				input = {}
				if (this.props.match.params.type === "Overlap"){
					input.entities = {}
				} else {
					input.up_entities = {}
					input.down_entities = {}
				}
			}
			this.setState({
				searching: false,
				entries: new_entries,
				count: resource_entries.length,
				resources,
				input
			})
		} catch (error) {
			console.error(error)
		}
	}
	enrichment = async (query) => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {enrichment_id, ...enrichment} =  await this.props.resolver.enrichment(query, this.state.input)
			if (query.signature_id===undefined){
				this.props.history.push({
					pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}/${enrichment_id}`,
					state: {input: this.state.input}
				})
			}else {
				return enrichment
			}
			
		} catch (error) {
			console.error(error)
		}
	}

	performSigSearch = async () => {
		const input = this.state.input
		const query = {
			input_type: input.up_entities !== undefined ? "up_down": "set"
		}
		for (const [field, entities] of Object.entries(input)){
			query[field] = []
			for (const e of Object.values(entities)){
				query[field] = [...query[field], ...e.id]
			}
		}
		this.setState({
			searching: true,
			query
		}, ()=>this.enrichment(this.state.query))
	}

	componentDidUpdate = async (prevProps) => {
		const prevEnrichmentID = prevProps.match.params.enrichment_id
		const currEnrichmentID = this.props.match.params.enrichment_id
		if (prevEnrichmentID !== currEnrichmentID) {
			let input = {}
				if (this.props.match.params.type === "Overlap"){
					input.entities = {}
				} else {
					input.up_entities = {}
					input.down_entities = {}
				}
			if (currEnrichmentID !== undefined){
				if ((this.props.location.state|| {}).input !== undefined) input = this.props.location.state.input
				this.setState({
					input, 
					searching: true
				}, async () => {
					const enrichment = await this.get_enrichment(this.props.match.params.enrichment_id)
					if (enrichment) await this.process_enrichment(enrichment)
				})
			}else {
				await this.search_resources()
				this.setState({input})
			}
		}	
	}
	
	componentDidMount = async () => {
		const { schemas } = this.props
		const {type, enrichment_id} = this.props.match.params	
		const entity_schemas = schemas.filter(s=>s.type==="entity")
		const titles = []
		const synonyms = []
		for (const schema of entity_schemas){
			for (const prop of Object.values(schema.properties)){
				if (prop.type==="title") titles.push(prop.field)
				else if (prop.synonyms) synonyms.push(prop.field)
			}
		}
		const search_tabs = []
		for (const k of ['MetadataSearch', 'SignatureSearch']){
			const v = this.props.nav[k]
			search_tabs.push({
				label: v.navName,
				href: v.endpoint,
				value: v.navName,
			})
		}
		await this.search_resources()
		let input
		if (enrichment_id === undefined){
			input = {}
			if (type === "Overlap"){
				input.entities = {}
			} else {
				input.up_entities = {}
				input.down_entities = {}
			}
			this.setState({
				titles,
				synonyms,
				search_tabs,
				input,
				searching: false
			})
		} else {
			this.setState({
				titles,
				synonyms,
				search_tabs,
				searching: true
			}, async () => {
				const enrichment = await this.get_enrichment(this.props.match.params.enrichment_id)
				if (enrichment) await this.process_enrichment(enrichment)
			})
		}
	}

	handleSnackBarClose = (event, reason) => {
		this.setState({
			error: null
		}, ()=>this.props.history.push({
			pathname: `${this.props.nav.SignatureSearch.endpoint}`
		}))
	}

	render = () => {
		if (this.state.input === null) return <CircularProgress />
		else {
			const disabled = Object.keys(this.state.input.entities || {}).length === 0 || (Object.keys(this.state.input.up_entities || {}) === 0 && Object.keys(this.state.input.down_entities || {}).length === 0)
			return (
				<React.Fragment>
					<Snackbar open={this.state.error!==null}
						anchorOrigin={{ vertical:"top", horizontal:"right" }}
						autoHideDuration={6000}
						onClose={this.handleSnackBarClose}
						message={this.state.error}
						action={
							<IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
								<span className="mdi mdi-close-box mdi-24px"/>
							</IconButton>
						}
					/>
					<SignatureSearchComponent 
						searching={this.state.searching}
						resolving={this.state.resolving}
						entries={this.state.entries}
						PaginationProps={{
							page: this.state.page,
							rowsPerPage: this.state.perPage,
							count:  this.state.count,
							onChangePage: (event, page) => this.handleChangePage(event, page),
							onChangeRowsPerPage: this.handleChangeRowsPerPage,
						}}
						ModelTabProps={{
							tabs: this.state.vertical_tab_props,
							value: this.props.preferred_name[this.props.model],
							tabsProps:{
								orientation: "vertical",
								TabIndicatorProps: {
									style: {"left": 0}
								}
							},
							handleChange: this.handleTabChange
						}}
						TabProps={{
							tabs: [
								{
									label: this.props.preferred_name[this.state.model],
									value: this.props.preferred_name[this.state.model],
									count: this.state.count
								}
							],
							value: this.props.preferred_name[this.state.model],
							tabsProps:{
								centered: true
							},
						}}
						SearchTabProps={{
							tabs: this.state.search_tabs,
							value:"Signature Search",
							tabsProps:{
								centered: true
							},
							handleChange: this.handleTabChange
						}}
						TextFieldSuggestProps={{
							input: this.state.input,
							onAdd: this.onAddEntity,
							onSubmit: this.performSigSearch,
							onDelete: this.onDeleteEntity,
							onSuggestionClick: this.onSuggestionClickEntity,
							examples: this.props.examples,
							type: this.props.match.params.type,
							disabled,
						}}
					/>
				</React.Fragment>
				
			)
		}
	}
	
}

SignatureSearch.propTypes = {
	nav: PropTypes.shape({
		MetadataSearch: PropTypes.shape({
			endpoint: PropTypes.string
		}),
		SignatureSearch: PropTypes.shape({
			endpoint: PropTypes.string
		}),
	}).isRequired,
	overlap_search: PropTypes.boolean,
	rank_search: PropTypes.boolean,
	schemas: PropTypes.array.isRequired,
	preferred_name: PropTypes.shape({
		resources: PropTypes.string,
		libraries: PropTypes.string,
		signatures: PropTypes.string,
		entities: PropTypes.string,
	}),
	resource_libraries: PropTypes.shape({
		lib_id_to_name: PropTypes.objectOf(PropTypes.string),
		lib_name_to_id: PropTypes.objectOf(PropTypes.string),
		resource_id_to_name: PropTypes.objectOf(PropTypes.string),
		resource_name_to_id: PropTypes.objectOf(PropTypes.string),
		lib_to_resource: PropTypes.objectOf(PropTypes.string),
		resource_to_lib: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
	}),
	examples: PropTypes.arrayOf(
		PropTypes.oneOf([
			PropTypes.shape({
				type: PropTypes.oneOf(["Overlap"]),
				entities: PropTypes.string,
				label: PropTypes.string
			}),
			PropTypes.shape({
				type: PropTypes.oneOf(["Rank"]),
				up_entities: PropTypes.string,
				down_entities: PropTypes.string,
				label: PropTypes.string
			})
		])
	)
}