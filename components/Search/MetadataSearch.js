import React from 'react'
import {build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import { MetadataSearchComponent } from './MetadataSearchComponent'
import { get_filter, resolve_ids } from './utils'


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
			paginate: false,
			searching: false,
		}
	}

	process_search = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {schemas} = this.props
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
				const e = labelGenerator(await entry,
					schemas,
					"#" + this.props.preferred_name[this.props.model] +"/")
				entries.push(e)
			}
			
			if (!this.state.paginate) this.get_value_count(where, query)
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
		}
	}

	get_value_count = async (where, query) =>{
		try {
			const filter_fields = {}
			const fields = []
			const {lib_id_to_name, resource_id_to_name} = this.props.resource_libraries
			for (const prop of this.props.filter_props){
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
				const value_count = await this.props.resolver.aggregate(
					`/${this.props.model}/value_count`, 
					{
						where,
						fields,
						limit: 20,
					})
				const filters = {}
				for (const [field, values] of Object.entries(value_count)){
					if (field === "library"){
						filters[field] = {
							...filter_fields[field],
							values: Object.entries(values).reduce((acc, [id, count])=> {
								acc[lib_id_to_name[id]] = count
								return acc
							},{})
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
						filters[field] = {
							...filter_fields[field],
							values: Object.entries(values).reduce((acc, [id, count])=> {
								acc[resource_id_to_name[id]] = count
								return acc
							},{})
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
			this.props.resolver.abort_controller()
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
			})
	}

	paginate = async (limit, skip) => {
		const query = {
			...this.state.query,
			limit,
			skip
		}
		
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?query=${JSON.stringify(query)}`,
			state: {
				paginate: true
			}
		  })
	}

	handleChangePage = async (event, page) => {
		const { perPage:limit } = this.state
		const skip = limit*page
		await this.paginate(limit, skip)
	}

	handleChangeRowsPerPage = async (e) => {
		const { page } = this.state
		const limit = e.target.value
		const skip = limit*page
		await this.paginate(limit, skip)
	}

	handleTabChange = (v) => {
		console.log(v)
		this.props.history.push({
			pathname: v.href,
		})
	}

	componentDidMount = () => {
		const vertical_tab_props = []
		for (const model of ['resources', 'libraries', 'signatures', 'entities']){
			if (this.props.preferred_name[model]!==undefined){
				const endpoint = this.props.nav.MetadataSearch.endpoint
				vertical_tab_props.push({
					label: this.props.preferred_name[model],
					href: `${endpoint}/${this.props.preferred_name[model]}`,
					value: this.props.preferred_name[model],
				})
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
			searching: true,
			vertical_tab_props,
			search_tabs,
		}, ()=>{
			this.process_search()
		})	
	}

	componentDidUpdate = (prevProps) => {
		const prev_search = decodeURI(prevProps.location.search)
		const curr_search = decodeURI(this.props.location.search)
		if (prevProps.model !== this.props.model || prev_search !== curr_search){
			this.setState({
				searching: true,
				paginate: (this.props.location.state || {}).paginate ? true: false,
				filters: {},
			}, ()=>{
				this.process_search()
			})
		}
	}

	render = () => {
		if (this.state.entries==null){
			return <CircularProgress />
		}
		return (
			<MetadataSearchComponent
					searching={this.state.searching}
					search_terms={this.state.query.search || []}
					search_examples={this.props.search_examples}
					filters={Object.values(this.state.filters)}
					onSearch={this.onSearch}
					onFilter={this.onClickFilter}
					entries={this.state.entries}
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
								label: this.props.preferred_name[this.props.model],
								value: this.props.preferred_name[this.props.model],
								count: this.state.count
							}
						],
						value: this.props.preferred_name[this.props.model],
						tabsProps:{
							centered: true
						},
					}}
					SearchTabProps={{
						tabs: this.state.search_tabs,
						value:"Metadata Search",
						tabsProps:{
							centered: true
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
	schemas: PropTypes.array.isRequired,
	filter_props: PropTypes.arrayOf(PropTypes.shape({
		type: PropTypes.string,
		field: PropTypes.string,
		search_field: PropTypes.string,
		text: PropTypes.string,
		icon: PropTypes.string,
	})),
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
	})
}
