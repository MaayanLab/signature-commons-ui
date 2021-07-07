import React from 'react'
import PropTypes from 'prop-types'
import { labelGenerator, getName, getPropValue } from '../../util/ui/labelGenerator'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { get_signature_entities,
	create_query,
	reset_input,
	enrichment,
	download_input } from './utils'
import Button from '@material-ui/core/Button';

import dynamic from 'next/dynamic'
import { thresholdScott } from 'd3-array'
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const Snackbar = dynamic(()=>import('@material-ui/core/Snackbar'));
const SignatureSearchComponent = dynamic(async () => (await import('./SignatureSearchComponent')).SignatureSearchComponent);

const stat_mapper = {
	entities: "set_stats",
	up_entities: "up_stats",
	down_entities: "down_stats",
}
export default class SignatureSearch extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			children: null,
			input: null,
			model: "resources",
			searching: false,
			resolving: false,
			query: {},
			error: null,
			page: 0,
			perPage: 10,
			order_field: "p-value",
			order: "ASC",
			scatter_data: null,
			resources: null,
			libraries: null,
			visualization: {},
		}
	}

	handleTabChange = (v) => {
		this.props.history.push({
			pathname: v.href,
		})
	}

	convert_text = (text, prop) => {
		if (prop.strategy === "upper") text = text.toUpperCase();
		else if (prop.strategy === "lower") text = text.toLowerCase();
		return text
	}

	fetch_names = async (name_fields, entities_labels) => {
		const or = []
		if (name_fields.length === 0) return {}
		for (const prop of name_fields){
			const entities = []
			for (const label of entities_labels){
				const l = this.convert_text(label, prop)
				entities.push(l)
			}
			if (prop.type === 'array'){		
				or.push({[prop.field]:{
					any: entities
				}})
			}else {
				or.push({[prop.field]:{
					inq: entities
				}})
			}
		}
		const filter = {
			where: {or}
		}
		const {entries: results} = await this.props.resolver.filter_metadata({
			model: "entities",
			filter,
		})
		return results
	}

	resolve_entities = async () => {
		try {
			const {schemas} = this.props
			let { up_stats={}, down_stats={}, set_stats={}, ...input} = this.state.input
			// const input = {...this.state.input}
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
			let stats = {}
			let name_mapper = {}
			if (input.entities!==undefined){
				stats = {
					entities: set_stats
				}
				name_mapper = {
					entities: "set_stats"
				}
			} else {
				stats = {
					up_entities: up_stats,
					down_entities: down_stats
				}
				name_mapper = {
					up_entities: "up_stats",
					down_entities: "down_stats"
				}
			}
			// Resolve titles first
			const name_results = await this.fetch_names(this.state.titles, entities_labels)
			const resolved_labels = []
			for (const prop of this.state.titles){
				const label_mapper = {}
				for (const l of entities_labels) {
					if (resolved_labels.indexOf(l) === -1) label_mapper[this.convert_text(l , prop)] = l
				}
				for (const e of Object.values(name_results)){
					// makeTemplate result is already converted is already converted to upper, lower, etc
					const entry = await e.entry()
					const label = label_mapper[makeTemplate(prop.text, entry)]
					for (const field of Object.keys(input)){
						if (input[field][label] !== undefined){
							input[field][label] = {
								label,
								type: "valid",
								id: [entry.id]
							}
							stats[field].valid = (stats[field].valid || 0) + 1
							resolved_labels.push(label)
						}
					}
				}
			}

			// Resolve synonyms
			const unresolved_labels = entities_labels.filter(l=>resolved_labels.indexOf(l)===-1)
			if (unresolved_labels.length > 0 && this.state.synonyms.length > 0){
				const synonym_results = await this.fetch_names(this.state.synonyms, unresolved_labels)
				for (const prop of this.state.synonyms){
					const label_mapper = {}
					for (const l of unresolved_labels) {
						if (resolved_labels.indexOf(l) === -1) label_mapper[this.convert_text(l , prop)] = l
					}
					for (const e of Object.values(synonym_results)){
						const entry = await e.entry()
						const prop_values = getPropValue(entry, prop)
						const synonyms = prop_values.object || [prop_values.text]
						// makeTemplate result is already converted is already converted to upper, lower, etc
						let resolved = false
						for (const label of synonyms) {
							for (const field of Object.keys(input)){
								if (input[field][label] !== undefined){
									if ((input[field][label].suggestions || []).length === 0) {
										stats[field].suggestions = (stats[field].suggestions || 0) + 1
									}
									input[field][label] = {
										label,
										type: "suggestions",
										suggestions: [...(input[field][label].suggestions || []), {
											id: [entry.id],
											label: getName(entry, schemas),
											type: "valid"
										}]
									}
									resolved_labels.push(label)
									resolved = true
									break
								}
							}
							if (resolved) break
						}
					}
				}
			}

			for (const [field, entities] of Object.entries(input)){
				for (const [k,v] of Object.entries(entities)){
					if (v.type==="loading"){
						
						input[field][k].type = "invalid"
						stats[field].invalid = (stats[field].invalid || 0) + 1
					}
				}
			}
			for (const field of Object.keys(input)){ 
				input[name_mapper[field]] = stats[field]
			}
			this.setState({
				input: {
					...input,
				},
				resolving: false,
			})
		} catch (error) {
			console.error(error)
		}
	}
	
	onAddEntity = (value, field) => {
		this.setState((prevState, prevProps)=>{
			const field_input = {...prevState.input[field]}
			for (const v of value.trim().split(/[\t\r\n;]+/)){
				const val = v.trim()
				if (v!==""){
					field_input[val] = {
						label: val,
						type: "loading"
					}
				}
			}
			return({
				input: {
					...prevState.input,
					[field]: field_input,
				},
				field,
				resolving: true
			})
		}, () => this.resolve_entities())
	  }

	onDeleteEntity = (value, field) => {
		if (this.state.input[stat_mapper[field]]!==undefined){
			this.setState((prevState)=>{
				let input = {...prevState.input}
				for (const v of value.trim().split(/[\t\r\n;]+/)){
					const {[v]:popped, ...entities} = input[field]
					if (popped!==undefined){
						input = {
							...input,
							[field]: {
								...entities
							}
						}
						if (input[stat_mapper[field]][popped.type] > 0) input[stat_mapper[field]][popped.type] = input[stat_mapper[field]][popped.type] -1
					}
				}
				return {
					input, 
				}
			})
		}
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
			input[stat_mapper[field]].valid = (input[stat_mapper[field]].valid || 0) + 1
			input[stat_mapper[field]].suggestions = input[stat_mapper[field]].suggestions - 1
			return {
				input, 
			}
		})
	}

	resolve_enrichment = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {model, resource_order} = this.props
			const { type, enrichment_id} = this.props.match.params
			const {lib_to_resource,
				resource_to_lib } = this.props.resource_libraries
			const {resources: resources_entries} = await this.props.resolver.resolve_all_enrichment({
				enrichment_id,
				lib_to_resource,
				resource_to_lib
			})
			if (Object.keys(resources_entries).length === 0){
				throw new Error("No results")
			}
			const entries = await Promise.all(Object.values(resources_entries).map(async (i)=> await i.entry()))
			const resources = entries.map(e=>labelGenerator(e, this.props.schemas,
				`#/Enrichment/${type}/${enrichment_id}/${this.props.preferred_name.resources}/`+'${id}'
				))
			const sorted_resources = resources.sort((a,b)=>{
				if (resource_order[a.data.id] !== undefined && resource_order[a.data.id]) {
					return resource_order[a.data.id].priority - resource_order[b.data.id].priority
				} else return b.data.scores.signature_countc-a.data.scores.signature_count
			})

			// let resource_id = sorted_tabs[0].value
			
			// let library_id
			// let resource
			// if (model === 'resources' || id === undefined){
			// 	if (id !== undefined) {
			// 		resource_id = id
			// 	}
			// 	resource = await resources[resource_id].serialize(false, true)
			// } else if (model === 'libraries'){
			// 	library_id = id
			// 	resource_id = lib_to_resource[library_id]
			// 	resource = await resources[resource_id].serialize(false, true)
			// }

			// const {labels: libraries, entry_id: tmp_library_id} = this.get_libraries_labels(resource.libraries,
			// 	type,
			// 	enrichment_id,
			// 	'libraries')
			
			// if (library_id === undefined) library_id = tmp_library_id
			this.setState({
				resources: sorted_resources,
				searching: false,
			})

		} catch (error) {
			this.props.resolver.abort_controller()
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "resolve_enrichment error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
		}
	}

	node_click = (v) => {
		const {type, enrichment_id} = this.props.match.params
		const model = this.props.preferred_name.signatures
		const id = v.id
		this.props.history.push({
			pathname: `/Enrichment/${type}/${enrichment_id}/${model}/${id}`,
		})
	}

	signature_search = async () => {
		const {input} = this.state
		const query = create_query(input)
		this.setState({
			query,
			searching: true,
		}, async ()=>{
			const enrichment_id = await enrichment(query, input, this.props.resolver, this.handleError)
			this.redirect_or_stay(enrichment_id)
		})
	}

	redirect_or_stay = (enrichment_id) => {
		if (this.props.match.params.enrichment_id === enrichment_id){
			this.setState({
				searching: false
			})
		}else {
			this.props.history.push({
				pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}/${enrichment_id}`,
				state: {input: this.state.input}
			})
		}
	}
	
	
	handleError = (error) => {
		this.setState({
			error: error.message
		})
	}
	
	process_input = async () => {
		try {
			const enrichment_id = this.props.match.params.enrichment_id
			let input
			let query = {}
			let error = null
			if (enrichment_id === undefined){
				input = reset_input(this.props.match.params.type)
			} else {
				// there's an enrichment_id
				const match = this.props.resolver.get_enrichment(enrichment_id)
				if (match === undefined){
					input = await get_signature_entities(enrichment_id,
						this.props.resolver,
						this.props.schemas,
						this.handleError)
					if (input!==null && input!==undefined){
						query = create_query(input, enrichment_id)
						const eid = await enrichment(query, input, this.props.resolver, this.handleError)
					} else{
						input = reset_input(this.props.match.params.type)
						error = "Invalid signature"
					}
				} else {
					input = match.input
				}
			}
			this.setState({
				input,
				query,
				error,
				searching: this.props.match.params.enrichment_id!==undefined
			}, () => {
				if (this.props.match.params.enrichment_id!==undefined){
					this.resolve_enrichment()
				} 	
			})
		} catch (error) {
			this.props.resolver.abort_controller()
			console.error(error)
			this.setState({
				error:error.message
			})
		}
	}

	componentDidUpdate = async (prevProps) => {
		const prevEnrichmentID = prevProps.match.params.enrichment_id
		const enrichment_id = this.props.match.params.enrichment_id
		const prevType = prevProps.match.params.type
		const type = this.props.match.params.type
		const id = this.props.match.params.id
		const previd = prevProps.match.params.id
		if (type !== prevType) {
			this.props.resolver.abort_controller()
			this.setState({
				resolving: false,
			}, () => this.process_input());
		}else if (prevEnrichmentID !== enrichment_id) {
			this.setState(prevState=>({
				entries: null,
				resources: null,
				libraries: null,
				searching: true,
				input: enrichment_id === undefined? reset_input(this.props.match.params.type): prevState.input,
			}), () => this.process_input());
		}
	}

	componentDidMount = async () => {
		const { schemas } = this.props
		const {type, enrichment_id} = this.props.match.params	

		// Get title and synonyms
		const entity_schemas = schemas.filter(s=>s.type==="entity")
		const titles = []
		const synonyms = []
		// const fields = []
		for (const schema of entity_schemas){
			for (const prop of Object.values(schema.properties)){
				if (prop.type==="title" && titles.indexOf(prop.field) === -1) titles.push(prop)
				else if (prop.type==="alternative" && titles.indexOf(prop.field) === -1) titles.push(prop)
				else if (prop.synonyms && synonyms.indexOf(prop.field) === -1) synonyms.push(prop)
			}
		}
		// Process search tabs
		const search_tabs = []
		const search_tab_list = this.props.nav.MetadataSearch.landing ? ['MetadataSearch', 'SignatureSearch']: ['SignatureSearch', 'MetadataSearch']
		for (const k of search_tab_list){
			const v = this.props.nav[k]
			if (v.active){
				search_tabs.push({
					label: v.navName,
					href:  v.endpoint,
					value: k,
				})
			}
		}
		this.setState({
			titles,
			synonyms,
			search_tabs,
			entries: null,
			index: null,
		}, () => {
			this.process_input()
		});
	}

	handleSnackBarClose = (event, reason) => {
		const input = reset_input(this.props.match.params.type)
		this.setState({
			error: null,
			input,
			resolving: false,
		}, ()=>{
		if (this.props.match.params.enrichment_id){
			this.props.history.push({
				pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}`
			})	
		}
		})
	}

	setVisualization = (id, viz) => {
		this.setState(prevState=>({
			visualization: {
				...prevState.visualization,
				[id]: viz,
			}
		}))
	}

	toggle_input_type = () => {
		const {type} = this.props.match.params
		const opposite_type = type === "Overlap" ? "Rank": "Overlap"
		this.props.history.push({
			pathname: `${this.props.nav.SignatureSearch.endpoint}/${opposite_type}`,
		})
	}

	render = () => {
		if (this.state.input === null) return <div style={{paddingTop: 100, textAlign: "center"}}><CircularProgress/></div>
		else {
			let disabled = false
			if (this.state.input.entities !== undefined){
				disabled = Object.keys(this.state.input.entities || {}).length === 0
			}else if (this.state.input.up_entities !== undefined){
				disabled = (Object.keys(this.state.input.up_entities || {}).length === 0 && Object.keys(this.state.input.down_entities || {}).length === 0)
			}
			return (
				<React.Fragment>
					<Snackbar open={this.state.error!==null}
						anchorOrigin={{ vertical:"top", horizontal:"right" }}
						autoHideDuration={500}
						onClose={this.handleSnackBarClose}
						message={this.state.error}
						action={
							<Button size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
								<span className="mdi mdi-close-box mdi-24px"/>
							</Button>
						}
					/>
					<SignatureSearchComponent 
						resolver={this.props.resolver}
						schemas={this.props.schemas}
						searching={this.state.searching}
						resolving={this.state.resolving}
						library_priority={this.props.library_priority}
						tutorial={this.props.nav.SignatureSearch.props.types[this.props.match.params.type].tutorial}
						description={this.props.nav.SignatureSearch.props.types[this.props.match.params.type].description}
						download_input={()=>download_input(this.state.input)}
						entries={this.state.resources}
						ui_values={{nav: this.props.nav, preferred_name: this.props.preferred_name}}
						serverSideProps={this.props.serverSideProps}
						ResultsProps={{
							entries: this.state.libraries,
							onClick: this.node_click,
							visualization: this.state.visualization,
							setVisualization: this.setVisualization,
							entity_name: this.props.preferred_name.entities.toLowerCase(),
							EnrichmentPageProps: {...this.props, input: this.state.input},
							header: `Significant terms identified for ${this.props.preferred_name.resources}`
						}}
						PaginationProps={{
							page: this.state.page,
							rowsPerPage: this.state.perPage,
							count:  (this.state.libraries || []).length,
							onChangePage: (event, page) => this.handleChangePage(event, page),
							onChangeRowsPerPage: this.handleChangeRowsPerPage,
						}}
						SearchTabProps={{
							tabs: this.state.search_tabs,
							value: "SignatureSearch",
							tabsProps:{
								centered: true
							},
							handleChange: this.handleTabChange
						}}
						TextFieldSuggestProps={{
							input: this.state.input,
							onAdd: this.onAddEntity,
							onSubmit: this.signature_search,
							onDelete: this.onDeleteEntity,
							onSuggestionClick: this.onSuggestionClickEntity,
							resetInput: ()=>{
								const input = reset_input(this.props.match.params.type)
								this.setState({input})
								return input
							},
							reset: this.props.match.params.enrichment_id === undefined,
							examples: this.props.examples,
							type: this.props.match.params.type,
							toggleSwitch: this.toggle_input_type,
							disabled,
						}}
						enrichment_tabs={this.props.enrichment_tabs}
						filters={this.state.libraries === null ? []:[
							{
								name: this.props.preferred_name.libraries,
								field: 'libraries',
								priority: 1,
								values: this.state.libraries,
								radio:true,
								value: this.props.resource_libraries.lib_id_to_name[this.state.library_id],
								icon: "mdi-library-books"
							}
						]}
						submitName={`Perform ${this.props.preferred_name_singular.signatures} Enrichment Analysis`}
						type={this.props.match.params.type}
						enrichment_id={this.props.match.params.enrichment_id}
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
	enrichment_tabs: PropTypes.objectOf(PropTypes.oneOf([
		PropTypes.shape({
			label: PropTypes.string,
			href: PropTypes.string,
			type: PropTypes.string,
			icon: PropTypes.string,
			placeholder: PropTypes.string,
		}),
		PropTypes.shape({
			label: PropTypes.string,
			href: PropTypes.string,
			type: PropTypes.string,
			icon: PropTypes.string,
			up_placeholder: PropTypes.string,
			down_placeholder: PropTypes.string,
		})
	])),
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
	),
	about: PropTypes.string
}