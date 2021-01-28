import React from 'react'
import {DataResolver, build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import { get_filter, resolve_ids } from './utils'
import PropTypes from 'prop-types'
import {SignatureSearchComponent} from './SignatureSearchComponent'

export default class SignatureSearch extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			entries: null,
			model: "resources",
			resolver: new DataResolver(),
			searching: false
		}
	}

	search_resources = async () => {
		try {
			this.state.resolver.abort_controller()
			this.state.resolver.controller()
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
			const {entries: results, count} = await this.state.resolver.filter_metadata({
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
			
			this.state.resolver.abort_controller()
			this.state.resolver.controller()
			
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
			const {entries: results} = await this.state.resolver.filter_metadata({
				model: "entities",
				filter,
			})
			
			for (const c of Object.values(results)){
				const entry = await c.entry()
				const e = labelGenerator(await entry,
					schemas,
					"#" + this.props.preferred_name[this.state.model] +"/")
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
				input
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
				field
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

	componentDidMount = () => {
		const { schemas } = this.props
		const {type} = this.props.match.params
		const input = {}
		if (type === "Overlap"){
			input.entities = {}
		} else {
			input.up_entities = {}
			input.down_entities = {}
		}
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
		this.setState({
			titles,
			synonyms,
			search_tabs,
			input
		}, ()=> this.search_resources())
	}

	render = () => {
		if (this.state.entries === null) return <CircularProgress />
		else {
			return (
				<SignatureSearchComponent 
					searching={this.state.searching}
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
						onSubmit: this.onAddEntity,
						onDelete: this.onDeleteEntity,
						onSuggestionClick: this.onSuggestionClickEntity,
					}}
				/>
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
	})
}