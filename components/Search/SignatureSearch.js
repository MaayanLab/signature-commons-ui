import React from 'react'
import {build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator, getName, getPropType } from '../../util/ui/labelGenerator'
import { get_signature_entities, create_query, reset_input, enrichment, get_filter } from './utils'
import PropTypes from 'prop-types'
import {SignatureSearchComponent} from './SignatureSearchComponent'
import ScorePopper from '../ScorePopper';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import Downloads from '../Downloads'
import {download_signature} from './utils'
import {Collapsible} from './SignatureSearchComponent'
const id_mapper = {
	resources: "resource_id",
	libraries: "library_id",
	signatures: "signature_id",
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
			visualize: false,
			scatter_data: null,
			resources_tabs: null,
			libraries: null,
			fetching_children: false,
			visualization: "scatter",
			library_entries: {}
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
			this.props.resolver.abort_controller()
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "resolve_entities error: "+ error.message
					}
				} else return {
					error: prevState.error
				}
			})
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

	score_popper = (props) => {
		return <ScorePopper {...props}/>
	}

	create_tab_values = (entries, endpoint, type, enrichment_id, model_name) => {
		let entry_id
		let sig_count = 0
		const tabs = []
		for (const entry of entries) {
			const entry_name = getName(entry, this.props.schemas)
			tabs.push({
				label: entry_name,
				href: `${endpoint}/${type}/${enrichment_id}/${model_name}/${entry.id}`,
				value: entry.id,
				count: entry.scores.signature_count,
				icon: getPropType(entry, this.props.schemas, "img").src
			})
			if (sig_count < entry.scores.signature_count){
				sig_count = entry.scores.signature_count
				entry_id = entry.id
			}
		}
		return {
			tabs,
			entry_id
		}
	}

	collapsible_component = (props) => {
		const {id, href} = props
		const {library_entries, library_id} = this.state
		if (id!==library_id) return null
		return(
			<Collapsible 
				open={id===this.state.library_id}
				data={library_entries[library_id]}
				active={this.state.visualization}
				signature_name={this.props.preferred_name.signatures}
				onButtonClick={(visualization)=>this.setState({visualization})}
				onNodeClick={this.scatter_node_click}
				href={href}
			/>
		)
	}

	get_entry_labels = (entries, type, enrichment_id, model) => {
		const labels = []
		let entry_id
		let score
		for (const entry of entries){
			let e
			if (model!=="entities"){
				e = labelGenerator(entry,
					this.props.schemas,
					`#/Enrichment/${type}/${enrichment_id}/${this.props.preferred_name[model]}/`)
			}else {
				e = labelGenerator(entry, this.props.schemas)
			}
			e["RightComponents"] = []
			e["BottomComponents"] = [{
				component: this.collapsible_component,
				props: {
					id: entry.id,
					href: e.info.endpoint
				}
			}]
			e["LeftComponents"] = [{
				component: props => <Button {...props}><span className={`mdi mdi-24px mdi-chevron-${this.state.library_id === entry.id ? "up": "down"}`}/></Button>,
				props: {
					onClick:  () => {
						if (this.state.library_id === entry.id){
							this.setState({
								library_id: undefined
							})
						}else {
							this.setState({
								library_id: entry.id
							}, ()=>{
								this.props.history.push({
									pathname: `${this.props.nav.SignatureSearch.endpoint}/${type}/${enrichment_id}/${this.props.preferred_name[model]}/${e.data.id}`
								})
							})
							
						}
					}
				}
			}]
			if (entry.scores !== undefined && entry.scores.signature_count !== undefined){
				if (score === undefined){
					score = entry.scores.signature_count
					entry_id=entry.id
				}else if (score < entry.scores.signature_count){
					score = entry.scores.signature_count
					entry_id=entry.id
				}
				e["RightComponents"].push({
					component: this.score_popper,
					props: {
						scores: Object.entries(entry.scores).reduce((acc,[label,value])=>({
							...acc,
							[label]: {
								label: label.replace(/_/,' '),
								value, 
							}
						}), {}),								
						GridProps: {
							style: {
								textAlign: "right",
								marginRight: 5
							}
						}
					}
				})
			}	
			labels.push(e)
		}
		return {labels, entry_id}
	}

	resolve_enrichment = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const model = this.props.model
			const { type, enrichment_id, id } = this.props.match.params
			const {lib_to_resource,
				resource_to_lib } = this.props.resource_libraries
			const {resources} = await this.props.resolver.resolve_all_enrichment({
				enrichment_id,
				lib_to_resource,
				resource_to_lib
			})
			const {
				tabs: resources_tabs, 
				entry_id: tmp_resource_id
			} = this.create_tab_values(
				await Promise.all(Object.values(resources).map(async (i)=> await i.entry())),
				this.props.nav.SignatureSearch.endpoint,
				type,
				enrichment_id,
				this.props.preferred_name.resources
			)

			let resource_id = tmp_resource_id
			
			let library_id
			let resource
			if (model === 'resources' || id === undefined){
				if (id !== undefined) {
					resource_id = id
				}
				resource = await resources[resource_id].serialize(false, true)
			} else if (model === 'libraries'){
				library_id = id
				resource_id = lib_to_resource[library_id]
				resource = await resources[resource_id].serialize(false, true)
			}

			const {labels: libraries, entry_id: tmp_library_id} = this.get_entry_labels(resource.libraries,
				type,
				enrichment_id,
				'libraries')
			
			if (library_id === undefined) library_id = tmp_library_id
			
			const entry_object = await this.props.resolver.resolve_enrichment({
				enrichment_id,
				library_id,
				lib_to_resource,
				resource_to_lib,
			}) 
			this.setState({
				library_id,
				resource_id,
				resources_tabs: resources_tabs.sort((a,b)=>(b.count-a.count)),
				libraries: libraries.sort((a,b)=>(b.data.scores.signature_count-a.data.scores.signature_count)),
				entry_object,
				searching: false,
			}, ()=>{
				this.process_children()
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

	resolve_enrichment_from_resource = async () => {
		try {
			const { type, enrichment_id, id: resource_id } = this.props.match.params
			if (this.state.resources_tabs===null || resource_id ===undefined) {
				this.resolve_enrichment()
			} else {
				this.props.resolver.abort_controller()
				this.props.resolver.controller()
				const {lib_to_resource,
					resource_to_lib } = this.props.resource_libraries
				const resource = await this.props.resolver.resolve_enrichment({
					enrichment_id,
					resource_id,
					lib_to_resource,
					resource_to_lib,
				})

				const r = await resource.serialize(false, true)
				const {labels: libraries, entry_id: library_id} = this.get_entry_labels(
					resource.libraries,
					type,
					enrichment_id,
					'libraries'
				)
				
				const endpoint = this.props.nav.SignatureSearch.endpoint
				const model_name = this.props.preferred_name.libraries
				this.setState({
					library_id,
					resource_id,
					libraries: libraries.sort((a,b)=>(b.data.scores.signature_count-a.data.scores.signature_count)),
				}, () =>{
					this.props.history.push({
						pathname: `${endpoint}/${type}/${enrichment_id}/${model_name}/${library_id}`,
						state: {input: this.state.input}
					})
				})
			}
			
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

	resolve_enrichment_from_library = async () => {
		try {
			const { type, enrichment_id, id: library_id } = this.props.match.params
			if (this.state.resources_tabs===null || library_id ===undefined) {
				this.resolve_enrichment()
			} else if(this.state.libraries!==null){
				const resource_id = lib_to_resource[library_id]
				const entry_object = await this.props.resolver.resolve_enrichment({
					enrichment_id,
					library_id,
					lib_to_resource,
					resource_to_lib,
				}) 
				this.setState({
					entry_object,
					library_id,
					resource_id,
					searching: false,
				}, ()=>{
					this.process_children()
				})
			}else {
				this.props.resolver.abort_controller()
				this.props.resolver.controller()
				const {lib_to_resource,
					resource_to_lib } = this.props.resource_libraries

				const resource_id = lib_to_resource[library_id]
				const {resolve_entries} = this.props.resolver.resolve_entries({
					model:'resources',
					entries: [resource_id]
				})
				const resource = await resolve_entries[resource_id].serialize(false, true)
				
				const {
					label: libraries,
				} = this.get_entry_labels(
					resource.libraries,
					type,
					enrichment_id,
					'libraries'
				)

				const entry_object = await this.props.resolver.resolve_enrichment({
					enrichment_id,
					library_id,
					lib_to_resource,
					resource_to_lib,
				}) 
	
				this.setState({
					entry_object,
					library_id,
					resource_id,
					searching: false,
					libraries: libraries.sort((a,b)=>(b.scores.signature_count-a.scores.signature_count)),
				}, ()=>{
					this.process_children()
				})
			}
			
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

	get_children_data = (entries, type, enrichment_id, model, limit=10) => {
		const {
			scatterColor="#0063ff",
			inactiveColor="#713939"
		} = this.props
		const labels = []
		const scatter_data = []
		for (const entry of entries){
			if (labels.length < limit){
				const e = labelGenerator(entry,
					this.props.schemas,
					`#/Enrichment/${type}/${enrichment_id}/${this.props.preferred_name[model]}/`)
				labels.push(e)
			}
			scatter_data.push({
				name: getName(entry, this.props.schemas),
				id: entry.id,
				oddsratio: entry.scores["odds ratio"],
				logpval: -Math.log(entry.scores["p-value"]),
				pval: entry.scores["p-value"], 
				color: entry.scores["p-value"] < 0.05 ? scatterColor: inactiveColor,
			})	
		}
		return {labels, scatter_data}
	}

	process_children = async () => {
		try {
			const {library_entries, library_id, entry_object} = this.state
			if (library_entries[library_id]!==undefined) return
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {schemas} = this.props
			const { type, enrichment_id } = this.props.match.params
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const {limit=0,
				skip=0,
				order= [this.state.order_field, this.state.order],
				} = query
			const final_query = {
				order,
				search: query.search,
				limit: 0, 
			}
			const children_object = await entry_object.children(final_query)
			const children_count = children_object.count
			const children_results = children_object[entry_object.child_model]

			const { labels: children, scatter_data} = this.get_children_data(Object.values(children_results), type, enrichment_id, entry_object.child_model)
			
			// if (!this.state.paginate) this.get_value_count(where, query)
			this.setState({
				children_count,
				page: skip/limit,
				perPage: limit,
				query,
				fetching_children: false,
				paginate: false,
				visualize: entry_object.child_model === 'signatures',
				tab: this.props.label || Object.keys(children_count)[0],
				library_entries: {
					...library_entries,
					[entry_object.id]: {
						scatter_data,
						entries: children,
					}
				}
			})	
		} catch (error) {
			console.error(error)
		}		
	}

	scatter_node_click = (v) => {
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
					if (input!==null){
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
		
		
		const id = this.props.match.params.id
		const previd = prevProps.match.params.id
		if (prevEnrichmentID !== enrichment_id) {
			this.setState({
				entries: null,
				resources_tabs: null,
				libraries: null,
				visualize: false,
				library_entries: {},
			}, () => this.process_input());
		} else if(id !==previd){
			this.setState({
				visualize: false,
				fetching_children: true,
				visualization: "scatter",
			}, () => {
				const model = this.props.match.params.model
				if (model === "libraries") this.resolve_enrichment_from_library()
				else if (model === "resources") this.resolve_enrichment_from_library()
				else this.resolve_enrichment()
			});
			
		}
	}

	componentDidMount = async () => {
		const { schemas } = this.props
		const {type, enrichment_id} = this.props.match.params	

		// Get title and synonyms
		const entity_schemas = schemas.filter(s=>s.type==="entity")
		const titles = []
		const synonyms = []
		for (const schema of entity_schemas){
			for (const prop of Object.values(schema.properties)){
				if (prop.type==="title") titles.push(prop.field)
				else if (prop.type==="name") titles.push(prop.field)
				else if (prop.synonyms) synonyms.push(prop.field)
			}
		}
		// Process search tabs
		const search_tabs = []
		for (const k of ['MetadataSearch', 'SignatureSearch']){
			const v = this.props.nav[k]
			search_tabs.push({
				label: v.navName,
				href: v.endpoint,
				value: k,
			})
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
							<Button size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
								<span className="mdi mdi-close-box mdi-24px"/>
							</Button>
						}
					/>
					<SignatureSearchComponent 
						searching={this.state.searching}
						resolving={this.state.resolving}
						entries={this.state.libraries}
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
						ResourceTabProps={this.state.resources_tabs===null? undefined: {
							tabs: this.state.resources_tabs,
							value: this.state.resource_id,
							tabsProps:{
								centered: true,
								variant: "scrollable",
								scrollButtons: "auto",
								"aria-label": "scrollable auto tabs example",
							},
							handleChange: this.handleTabChange
						}}
						TextFieldSuggestProps={{
							input: this.state.input,
							onAdd: this.onAddEntity,
							onSubmit: this.signature_search,
							onDelete: this.onDeleteEntity,
							onSuggestionClick: this.onSuggestionClickEntity,
							examples: this.props.examples,
							type: this.props.match.params.type,
							disabled,
						}}
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