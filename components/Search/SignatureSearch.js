import React from 'react'
import {build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import { get_filter, resolve_ids, get_signature_entities, create_query, reset_input, enrichment } from './utils'
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
			error: null,
			page: 0,
			perPage: 10,
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
				searching: false,
				paginate: false,
			})
		} catch (error) {
			this.props.resolver.abort_controller()
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "search_resources error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
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

	badge = (props) => {
		return <Badge badgeContent={props.score} color="error"/>
	}	
	

	resolve_enrichment = async (enrichment_id) => {
		try {
			const schemas = this.props.schemas
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {lib_to_resource,
				resource_to_lib } = this.props.resource_libraries
			const results = await this.props.resolver.resolve_enrichment({
				enrichment_id,
				lib_to_resource,
				resource_to_lib
			})
			const entries = []
			for (const c of Object.values(results)){
				const entry = await c.entry()
				const e = labelGenerator(await entry,
					schemas,
					`#${this.props.location.pathname}/${this.props.preferred_name[c.model]}/`)
				if (entry.signature_count !== undefined && entry.signature_count.count !== undefined){
					e["RightComponents"] = [
						{
							component: this.badge,
							props: {
								score: entry.signature_count.count,
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
				entries.push(e)
			}
			const sorted_entries = entries.sort((a,b)=>b.data.signature_count.count - a.data.signature_count.count)
			
			this.setState({
				entries: sorted_entries,
				count: entries.length,
				searching: false,
				page: 0,
				perPage: entries.length,
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


	signature_search = async () => {
		const {input} = this.state
		const query = create_query(input)
		this.setState({
			query
		}, async ()=>{
			const enrichment_id = await enrichment(query, input, this.props.resolver, this.handleError)
			this.props.history.push({
				pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}/${enrichment_id}`,
				state: {input: this.state.input}
			})
		})
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
				console.log(input)
			}
			this.setState({
				input,
				query,
				error,
				searching: true
			}, () => {
				if (this.props.match.params.enrichment_id!==undefined){
					this.resolve_enrichment(this.props.match.params.enrichment_id)
				} else {
					this.search_resources()
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
		if (prevEnrichmentID !== enrichment_id) {
			this.process_input()
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
				value: v.navName,
			})
		}
		this.setState({
			titles,
			synonyms,
			search_tabs,
		}, () => this.process_input());
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
							onSubmit: this.signature_search,
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