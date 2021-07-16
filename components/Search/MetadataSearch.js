import React from 'react'
import {build_where} from '../../connector'
import PropTypes from 'prop-types'
import { labelGenerator } from '../../util/ui/labelGenerator'
import { get_filter, resolve_ids } from './utils'
import { getSearchFilters } from '../../util/ui/fetch_ui_props'

import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const MetadataSearchComponent = dynamic(async () => (await import('./MetadataSearchComponent')).MetadataSearchComponent);

export default class MetadataSearch extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			search_terms: [],
			entries: null,
			page: 0,
			perPage: 10,
			query: {skip:0, limit:10},
			filters: {},
			preserve_state: false,
			searching: false,
			processing: false
		}
	}

	

	process_search = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const schemas = this.props.schemas
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const resolved_query = resolve_ids({
				query,
				model: this.props.model,
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
				model: this.props.model,
				filter,
			})
			
			const entries = []
			for (const c of Object.values(results)){
				const entry = await c.serialize(true,false)
				const link = "#" + this.props.preferred_name[this.props.model] +"/${id}"
				if (this.props.model === "entities" && (this.props.nav.MetadataSearch.props.metadata_page.entities || {}).query !== undefined) {
					link = link + this.props.nav.MetadataSearch.props.metadata_page.entities.query
				}
				const e = labelGenerator(await entry,
						schemas,
						link,
						this.props.resolver
					)
				entries.push(e)
			}

			// let model_tab_props = this.get_model_tab_props(count)
			
			if (!this.state.preserve_state){ 
				this.get_count(where, count)
				this.get_value_count(where, query)
			}
			this.setState({
				count,
				entries,
				page: skip/limit,
				perPage: limit,
				query,
				searching: false,
				preserve_state: false,
				// model_tab_props,
			})	
		} catch (error) {
			console.error(error)
		}
	}

	get_count = async (where, count) => {
		if (!this.preserve_state){
			if (count > 5000 && count < 1000000) {
				const response = await this.props.resolver.count(
					`/${this.props.model}/count`, where)
				count = response.count
			}
			const model_tab_props = this.get_model_tab_props(count)
			this.setState({
				count,
				model_tab_props
			})
		}
	}

	get_value_count = async (where, query) =>{
		try {
			const filter_fields = {}
			const fields = []
			const {lib_id_to_name, resource_id_to_name} = this.props.resource_libraries
			for (const prop of this.state.filter_props[this.props.model] || []){
				if (prop.type === "filter"){
					const checked = {}
					const filters = query.filters || {}
					if (filters[prop.field]){
						for (const i of filters[prop.field]){
							checked[i] = true
						}
					}
					filter_fields[prop.field] = {
						name: prop.text,
						field: prop.field,
						search_field: prop.search_field || prop.field,
						checked: checked,
						priority: prop.priority,
						icon: prop.icon,
					}
					if (this.props.model !== "signatures" || prop.field !== "resource")
						fields.push(prop.field)
				}
			}
			if (fields.length > 0){
				const field_promise = fields.map(async (f)=> this.props.resolver.aggregate(
					`/${this.props.model}/value_count`, 
					{
						where,
						fields: [f],
						limit: f.startsWith("meta.") ? 30: undefined,
					}))
				const fulfilled = await Promise.all(field_promise)
				const value_count = fulfilled.reduce((acc, c)=>({
					...acc,
					...c
				}), {})
				const filters = {}
				for (const [field, values] of Object.entries(value_count)){
					if (field === "library"){
						const acc = {}
						for (const[id, count] of Object.entries(values)){
							if (id !== "null"){
								acc[lib_id_to_name[id]] = count
							}
						}
						filters[field] = {
							...filter_fields[field],
							values: acc
						}
						if (filter_fields.resource !== undefined){
							// resolve resources
							const {lib_to_resource} = this.props.resource_libraries
							const vals = {}
							for (const [k,v] of Object.entries(values)){
								const resource = lib_to_resource[k]
								if (vals[resource_id_to_name[resource]] === undefined){
									vals[resource_id_to_name[resource]] = v
								}
								else {
									vals[resource_id_to_name[resource]] = vals[resource_id_to_name[resource]] + v
								}
							}
							filters["resource"] = {
								...filter_fields["resource"],
								values: vals,
							}
						}
					} else if(field === "resource"){
						const acc = {}
						for (const[id, count] of Object.entries(values)){
							if (id !== "null"){
								acc[resource_id_to_name[id]] = count
							}
						}
						filters[field] = {
							...filter_fields[field],
							values: acc
						}
					}else {
						filters[field] = {
							...filter_fields[field],
							values
						}
					}
					
				}
				this.setState({
					filters
				})
			}
		} catch (error) {
			console.error(error)
		}
	}

	onSearch = (search) => {
		const query = {
			...this.state.query,
			search
		}
		this.setState({
			query,
			searching: true,
		}, ()=>{
			this.props.history.push({
				pathname: this.props.location.pathname,
				search: `?query=${JSON.stringify(query)}`,
				state: {
					preserve_state: false
				}
			})
		})
	}

	onClickFilter = (field, value) => {
		const {filters, query} = this.state
		const checked = (filters[field] || {}).checked || {} 
		checked[value] = checked[value] === undefined? true: !checked[value]
		query.filters = {
			...query.filters,
			[field]: Object.keys(checked).filter(k=>checked[k])
		}
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?query=${JSON.stringify(query)}`,
			state: {
				preserve_state: false
			}
			})
	}

	pagination = async (limit, skip) => {
		const query = {
			...this.state.query,
			limit,
			skip
		}
		
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?query=${JSON.stringify(query)}`,
			state: {
				preserve_state: true
			}
		  })
	}

	handleChangePage = async (event, page) => {
		const { perPage:limit } = this.state
		const skip = limit*page
		await this.pagination(limit, skip)
	}

	handleChangeRowsPerPage = async (e) => {
		const { page } = this.state
		const limit = e.target.value
		const skip = limit*page
		await this.pagination(limit, skip)
	}

	handleTabChange = (v) => {
		const {search} = this.state.query
		const query = {search}
		this.props.history.push({
			pathname: v.href,
			search: `?query=${JSON.stringify(query)}`,
			state: {
				preserve_state: false
			}
		})
	}

	get_model_tab_props = (count=null) => {
		const model_props = []
		for (const model of this.props.model_tabs){
			const preferred_name = this.props.preferred_name[model]
			if (preferred_name!==undefined){
				const endpoint = this.props.nav.MetadataSearch.endpoint
				let label
				if (this.props.model === model && count !== null) {
					label = `${preferred_name} (${count})`
				}
				else label = preferred_name
				model_props.push({
					label,
					href: `${endpoint}/${preferred_name}`,
					value: preferred_name,
				})
			}
		}
		return model_props
	}

	componentDidMount = async () => {
		const filter_props = await getSearchFilters()
		const model_tab_props = this.get_model_tab_props()
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
			searching: true,
			model_tab_props,
			search_tabs,
			filter_props,
			homepage: this.props.location.search === ""
		}, ()=>{
			if (this.props.location.search !== ""){
				this.process_search()
			}
		})	
	}

	componentDidUpdate = (prevProps) => {
		const prev_search = decodeURI(prevProps.location.search)
		const curr_search = decodeURI(this.props.location.search)
		if (prevProps.model !== this.props.model || prev_search !== curr_search){
			this.setState(prevState=>{
				let query = prevState.query
				let model_tab_props = prevState.model_tab_props
				if (this.props.location.search === "") {
					query = {skip:0, limit:10}
					model_tab_props = this.get_model_tab_props()
				}
				return {
					searching: true,
					preserve_state: (this.props.location.state || {}).preserve_state ? true: false,
					filters: (this.props.location.state || {}).preserve_state ? prevState.filters: {},
					homepage: this.props.location.search === "",
					query,
					model_tab_props,
				}
			}, ()=>{
				if (this.props.location.search !== ""){
					this.process_search()
				}
			})
		}
	}

	render = () => {
		if (this.state.search_tabs==undefined){
			return <Grid container align="center">
					<Grid item xs={12}>
						<CircularProgress />
					</Grid>
				</Grid>
		}
		return (
			<MetadataSearchComponent
					searching={this.state.searching}
					homepage={this.state.homepage}
					placeholder={this.props.placeholder}
					tutorial={this.props.nav.MetadataSearch.props.tutorial}
					description={this.props.nav.MetadataSearch.props.description}
					PaperProps={{style:{width: "50%"}}}
					search_terms={this.state.query.search || []}
					search_examples={this.props.search_examples}
					filters={Object.values(this.state.filters)}
					onSearch={this.onSearch}
					onFilter={this.onClickFilter}
					entries={this.state.entries}
					ui_values={{nav: this.props.nav, preferred_name: this.props.preferred_name}}
					stats={this.props.stats}
					DataTableProps={{
						onChipClick: v=>{
							if (v.clickable) this.onClickFilter(v.field, v.text)
						}
					}}
					DataTableProps={{
						onChipClick: v=>{
							if (v.clickable) this.onClickFilter(v.field, v.text)
						}
					}}
					PaginationProps={{
						page: this.state.page,
						rowsPerPage: this.state.perPage,
						count:  this.state.count,
						onChangePage: (event, page) => this.handleChangePage(event, page),
						onChangeRowsPerPage: this.handleChangeRowsPerPage,
					}}
					ModelTabProps={{
						tabs: this.state.model_tab_props,
						value: this.props.preferred_name[this.props.model],
						handleChange: this.handleTabChange,
						tabsProps:{
							centered: true,
						}
					}}
					SearchTabProps={{
						tabs: this.state.search_tabs,
						value:"MetadataSearch",
						tabsProps:{
							centered: true,
						},
						handleChange: this.handleTabChange
					}}
				/>
		)
	}

	
}

MetadataSearch.propTypes = {
	nav: PropTypes.shape({
		MetadataSearch: PropTypes.shape({
			endpoint: PropTypes.string
		}),
		SignatureSearch: PropTypes.shape({
			endpoint: PropTypes.string
		}),
	}).isRequired,
	model: PropTypes.string.isRequired,
	model_tabs: PropTypes.arrayOf(PropTypes.oneOf(["resources", "libraries", "signatures", "entities"])),
	schemas: PropTypes.array.isRequired,
	preferred_name: PropTypes.shape({
		resources: PropTypes.string,
		libraries: PropTypes.string,
		signatures: PropTypes.string,
		entities: PropTypes.string,
	}),
	topComponents: PropTypes.func,
	middleComponents: PropTypes.func,
	bottomComponents: PropTypes.func,
	resource_libraries: PropTypes.shape({
		lib_id_to_name: PropTypes.objectOf(PropTypes.string),
		lib_name_to_id: PropTypes.objectOf(PropTypes.string),
		resource_id_to_name: PropTypes.objectOf(PropTypes.string),
		resource_name_to_id: PropTypes.objectOf(PropTypes.string),
		lib_to_resource: PropTypes.objectOf(PropTypes.string),
		resource_to_lib: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
	}),
	landing_md: PropTypes.string,
}
