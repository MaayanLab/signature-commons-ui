import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator, getName, getPropType } from '../../util/ui/labelGenerator'
import { get_signature_entities,
	create_query,
	reset_input,
	enrichment,
	download_input } from './utils'
import PropTypes from 'prop-types'
import {SignatureSearchComponent} from './SignatureSearchComponent'
import ScorePopper from '../ScorePopper';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import Color from 'color'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { precise } from '../ScorePopper'

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
			resources_tabs: null,
			libraries: null,
			visualization: {},
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
			let { valid=0, invalid=0, suggestions=0} = this.state.input
			for (const c of Object.values(results)){
				const entry = await c.entry()
				const e = labelGenerator(await entry,
					schemas)
				const label = e.info.name.text
				const alternative_label = (e.info.alternative || {}).text
				for (const field of Object.keys(input)){
					if (input[field][label]!==undefined){
						if (input[field][label].id === undefined){
							if (input[field][label].type === "suggestions") {
								suggestions = suggestions - 1
							}
							input[field][label] = {
								label,
								type: "valid",
								id: [entry.id]
							}
							valid = valid + 1
						}
					} else if (input[field][alternative_label]!==undefined){
						if (input[field][alternative_label].id === undefined){
							if (input[field][alternative_label].type === "suggestions") {
								suggestions = suggestions - 1
							}
							input[field][alternative_label] = {
								label: alternative_label,
								type: "valid",
								id: [entry.id]
							}
							valid = valid + 1
						}
					} else {
						const synonyms = e.info.synonyms || []
						let add_suggestion = true
						for (const syn of synonyms){
							if (input[field][syn]!==undefined){
								if (input[field][syn].type === "loading"){
									input[field][syn] = {
										label: syn,
										type: "suggestions",
										suggestions: [...(input[field][syn].suggestions || []), {
											id: [e.data.id],
											label,
											type: "valid"
										}]
									}
									if (add_suggestion){
										add_suggestion = false
										suggestions = suggestions + 1
									}
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
						invalid = invalid + 1
					}
				}
			}
			
			this.setState({
				input: {
					...input,
					valid,
					invalid,
					suggestions,
				},
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
				const val = v.trim()
				input[field][val] = {
					label: val,
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
			if (input[value.type] > 0) input[value.type] = input[value.type] -1
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
			input.valid = input.valid + 1
			input.suggestions = input.suggestions - 1
			return {
				input, 
			}
		})
	}

	score_popper = (props) => {
		return <ScorePopper {...props}/>
	}

	create_tab_values = (entries, endpoint, type, enrichment_id, model_name) => {
		const tabs = []
		for (const entry of entries) {
			const entry_name = getName(entry, this.props.schemas)
			tabs.push({
				label: entry_name,
				href: `${endpoint}/${type}/${enrichment_id}/${model_name}/${entry.id}`,
				value: entry.id,
				c: entry.scores.signature_count,
				icon: (getPropType(entry, this.props.schemas, "img")[0] || {}).src
			})
		}
		return {
			tabs
		}
	}

	get_libraries_labels = (entries, type, enrichment_id, model) => {
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
			labels.push(e)
		}
		return {labels, entry_id}
	}

	resolve_enrichment = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {model, resource_order} = this.props
			const { type, enrichment_id, id } = this.props.match.params
			const {lib_to_resource,
				resource_to_lib } = this.props.resource_libraries
			const {resources} = await this.props.resolver.resolve_all_enrichment({
				enrichment_id,
				lib_to_resource,
				resource_to_lib
			})
			if (Object.keys(resources).length === 0){
				throw new Error("No results")
			}
			const {
				tabs: resources_tabs, 
			} = this.create_tab_values(
				await Promise.all(Object.values(resources).map(async (i)=> await i.entry())),
				this.props.nav.SignatureSearch.endpoint,
				type,
				enrichment_id,
				this.props.preferred_name.resources
			)
			const sorted_tabs = resources_tabs.sort((a,b)=>{
				if (resource_order[a.value] !== undefined && resource_order[a.value]) {
					return resource_order[a.value].priority - resource_order[b.value].priority
				} else return b.c-a.c
			})

			let resource_id = sorted_tabs[0].value
			
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

			const {labels: libraries, entry_id: tmp_library_id} = this.get_libraries_labels(resource.libraries,
				type,
				enrichment_id,
				'libraries')
			
			if (library_id === undefined) library_id = tmp_library_id
			console.log(sorted_tabs)
			console.log(libraries)
			this.setState({
				resource_id,
				resources_tabs: sorted_tabs,
				libraries: libraries.sort((a,b)=>(b.data.scores.signature_count-a.data.scores.signature_count)),
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
				const {labels: libraries, entry_id: library_id} = this.get_libraries_labels(
					resource.libraries,
					type,
					enrichment_id,
					'libraries'
				)
				
				const endpoint = this.props.nav.SignatureSearch.endpoint
				const model_name = this.props.preferred_name.libraries
				this.setState({
					resource_id,
					searching: false,
					libraries: libraries.sort((a,b)=>(b.data.scores.signature_count-a.data.scores.signature_count)),
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

	lazy_tooltip = async (payload) => {
		const {name, id, oddsratio, pval, setsize} = payload
		const {resolved_entries} = await this.props.resolver.resolve_entries({model: "signatures", entries: [id]})
		const entry_object = resolved_entries[id]
		const children = (await entry_object.children({limit:0})).entities || []
		const overlap = children.map(e=>getName(e, this.props.schemas))
		const overlap_text = overlap.join(", ")
		// if (setsize <= 15) overlap_text = overlap.join(", ")
		// else overlap_text = overlap.slice(0,15).join(", ") + "..."
		return(
			<Card style={{opacity:"0.8", textAlign: "left"}}>
				<CardContent>
					<Typography variant="h6">{name}</Typography>
					<Typography><b>odds ratio:</b> {precise(oddsratio)}</Typography>
					<Typography><b>p-value:</b> {precise(pval)}</Typography>
					{ setsize===0 ? null:
						<React.Fragment>
							<Typography><b>overlap size:</b> {setsize}</Typography>
							<Typography><b>overlaps:</b> {overlap_text}</Typography>
						</React.Fragment>
					}
				</CardContent>
			</Card>
		)
	}

	get_children_data = async (entries, type, enrichment_id, model, limit=10) => {
		const {
			barColor="#0063ff",
			scatterColor="#0063ff",
			inactiveColor="#9e9e9e"
		} = this.props
		const {order_field, order} = this.state
		const color = Color(barColor)
		const labels = []
		const scatter_data = []
		const bar_data = []
		
		const f = entries[0].scores[order_field]
		const firstVal = order === 'DESC' ? f: -Math.log(f)
		for (const entry of entries){
			// const overlap = (entry.entities || []).map(e=>getName(e, this.props.schemas))
			if (labels.length < limit){
				const e = labelGenerator(entry,
					this.props.schemas,
					`#/Enrichment/${type}/${enrichment_id}/${this.props.preferred_name[model]}/`)
				labels.push(e)

				const v = entry.scores[order_field]
				const value = order === 'DESC' ? v: -Math.log(v)
				const col = color.lighten(-((value/firstVal) - 1))
				bar_data.push({
					name: e.info.name.text,
					value,
					color: (entry.scores["p-value"] < 0.05 && entry.scores["overlap size"] > 1) ? col.hex(): inactiveColor,
					id: entry.id,
					oddsratio: entry.scores["odds ratio"],
					pval: entry.scores["p-value"], 
					setsize: entry.scores["overlap size"],
					tooltip_component: this.lazy_tooltip,
				})		
			}
			scatter_data.push({
				name: getName(entry, this.props.schemas),
				id: entry.id,
				oddsratio: entry.scores["odds ratio"],
				logpval: -Math.log(entry.scores["p-value"]),
				pval: entry.scores["p-value"], 
				setsize: entry.scores["overlap size"],
				tooltip_component: this.lazy_tooltip,
				color: (entry.scores["p-value"] < 0.05 && entry.scores["overlap size"] > 1) ? scatterColor: inactiveColor
			})	
		}
		return {labels, scatter_data, bar_data}
	}

	process_children = async (library_id) => {
		try {
			const { type, enrichment_id } = this.props.match.params
			
			const {lib_to_resource,
				resource_to_lib } = this.props.resource_libraries
			
			const entry_object = await this.props.resolver.resolve_enrichment({
				enrichment_id,
				library_id,
				lib_to_resource,
				resource_to_lib,
			}) 
			
			const final_query = {
				order: [this.state.order_field, this.state.order],
				limit: 0, 
			}
			const children_object = await entry_object.children(final_query, true)
			const children_results = children_object[entry_object.child_model]

			const { labels: entries, scatter_data, bar_data} = await this.get_children_data(Object.values(children_results), type, enrichment_id, entry_object.child_model)
			return {
				scatter_data,
				bar_data,
				entries,
			}
			// if (!this.state.paginate) this.get_value_count(where, query)
			// this.setState( prevState => ({
			// 	library_entries: {
			// 		...prevState.library_entries,
			// 		[entry_object.id]: {
			// 			scatter_data,
			// 			bar_data,
			// 			entries,
			// 		}
			// 	}
			// }))	
		} catch (error) {
			console.error(error)
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
		const prevType = prevProps.match.params.type
		const type = this.props.match.params.type
		const id = this.props.match.params.id
		const previd = prevProps.match.params.id
		if (type !== prevType) {
			this.process_input()
		}else if (prevEnrichmentID !== enrichment_id) {
			this.setState({
				entries: null,
				resources_tabs: null,
				libraries: null,
				searching: true,
			}, () => this.process_input());
		} else if(id !==previd){
			this.setState({
				visualization: {},
				searching: true,
			}, () => {
				const model = this.props.match.params.model
				if (model === "resources") this.resolve_enrichment_from_resource()
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
				else if (prop.type==="alternative") titles.push(prop.field)
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

	setVisualization = (id, viz) => {
		this.setState(prevState=>({
			visualization: {
				...prevState.visualization,
				[id]: viz,
			}
		}))
	}

	render = () => {
		if (this.state.input === null) return <div style={{paddingTop: 100, textAlign: "center"}}><CircularProgress/></div>
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
						download_input={()=>download_input(this.state.input)}
						ResultsProps={{
							entries: this.state.libraries,
							process_children: this.process_children,
							onClick: this.node_click,
							visualization: this.state.visualization,
							setVisualization: this.setVisualization,
							entity_name: this.props.preferred_name.entities.toLowerCase()
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
						ResourceTabProps={this.state.resources_tabs===null? undefined: {
							tabs: this.state.resources_tabs,
							value: this.state.resource_id,
							tabsProps:{
								centered: true,
								indicator: false,
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
							},
							examples: this.props.examples,
							type: this.props.match.params.type,
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
	)
}