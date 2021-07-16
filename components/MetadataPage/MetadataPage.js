import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import {build_where} from '../../connector'
import { labelGenerator } from '../../util/ui/labelGenerator'
import {makeTemplate} from '../../util/ui/makeTemplate'
import { get_filter, resolve_ids } from '../Search/utils'

const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const Link = dynamic(()=>import('@material-ui/core/Link'))
const ShowMeta = dynamic(async () => (await import('../DataTable')).ShowMeta);
const IconComponent = dynamic(async () => (await import('../DataTable/IconComponent')).IconComponent);
const SearchResult = dynamic(async () => (await import('./SearchResult')).SearchResult);
const ResultsTab = dynamic(async () => (await import('../SearchComponents/ResultsTab')).ResultsTab);


export default class MetadataPage extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			search_terms: [],
			entry: null,
			page: 0,
			perPage: 10,
			metaTab: "metadata",
			query: {skip:0, limit:10},
			filters: {},
			paginate: false,
			childTab: null,
			childTabs: null,
		}
	}

	process_entry = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {model, id, schemas} = this.props
			// const skip = limit*page
			const {resolved_entries} = await this.props.resolver.resolve_entries({model, entries: [id]})
			const entry_object = resolved_entries[id]
			if (entry_object === undefined) {
				this.props.history.push({
					pathname: '/not-found',
				  })
			} 
			const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas,
										"#/" + this.props.preferred_name[entry_object.model] +"/${id}")
			const parent = labelGenerator(await entry_object.parent(), schemas, "#/" + this.props.preferred_name[entry_object.parent_model] +"/${id}")
			this.setState({
				entry_object,
				entry,
				parent,
			}, ()=> {
				this.process_children()
			})	
		} catch (error) {
			console.error(error)
		}
	}

	onChildTabChange = (event, childTab) => {
		if (childTab){
			this.setState({
				childTab
			},()=>{
				// const {limit, skip, ...rest } = this.state.query
				const query = {
					...this.state.query,
					direction: childTab
				}
				this.props.history.push({
					pathname: this.props.location.pathname,
					search: `?query=${JSON.stringify(query)}`,
				  })
			})
		}
	}

	process_children = async (direction=null) => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {schemas} = this.props
			const {
				lib_name_to_id,
				lib_id_to_name,
				resource_name_to_id,
				resource_to_lib
			} = this.props.resource_libraries
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const direction = query.direction
			const resolved_query = resolve_ids({
				query,
				model: this.state.entry_object.child_model,
				lib_name_to_id,
				lib_id_to_name,
				resource_name_to_id,
				resource_to_lib
			})
			const where = build_where(resolved_query)
			const {limit=10, skip=0, order} = query
			// const skip = limit*page
			const q = {
				limit, skip, order
			}
			if (where) q["where"] = where
			if (["signatures", "entities"].indexOf(this.state.entry_object.model) > -1 && this.state.childTab) {
				const dir = this.state.childTab === this.state.entry_object.child_model ? "-": this.state.childTab
				q.where = {
					...(q.where || {}),
					direction: direction || dir
				}
			}
			const {count: children_count, ...children_object} = await this.state.entry_object.children({...q})
			// const children_results = children_object[this.state.entry_object.child_model]
			const children = {}
			for (const[k,v] of Object.entries(children_object)){
				children[k] = []
				const link = "#" + this.props.preferred_name[this.state.entry_object.child_model] +"/${id}"
				if (this.state.entry_object.model === "signatures" && (this.props.nav.MetadataSearch.props.metadata_page.entities || {}).query !== undefined) {
					link = link + this.props.nav.MetadataSearch.props.metadata_page.entities.query
				}

				for (const entry of Object.values(v)){
					const e = labelGenerator(entry,
						schemas,
						link)
					children[k].push(e)
				}
			}
			

			if (!this.state.paginate) this.get_value_count(where, query)
			const childTabs = []
			for (const [k,v] of Object.entries(children_count)){
				if (v > 0){
					childTabs.push({
						label: k,
						value: k,
						handleChage: this.onChildTabChange
					})
				}
			}
			this.setState({
				children_count,
				children,
				tab: this.props.label || Object.keys(children_count)[0],
				page: skip/limit,
				perPage: limit,
				query,
				searching: false,
				paginate: false,
				childTab: (q.where||{}).direction || (childTabs[0] || {}).label,
				childTabs
			})
		} catch (error) {
			console.error(error)
		}
			
	}


	get_value_count = async (where, query) =>{
		try {
			const filter_fields = {}
			const fields = []
			const {lib_id_to_name, resource_id_to_name, lib_to_resource} = this.props.resource_libraries
			// const resource_lib = {}
			// let resource_prop
			for (const prop of Object.values(this.state.entry.schema.properties)){
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
					if (this.state.entry_object.child_model !== "signatures" || prop.field !== "resource")
						fields.push(prop.field)
				}
			}
			if (fields.length > 0){
				const field_promise = fields.map(async (f)=> this.props.resolver.aggregate(
					`/${this.state.entry_object.model}/${this.state.entry_object.id}/${this.state.entry_object.child_model}/value_count`, 
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
			console.error(error)
		}
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

	componentDidMount = () => {
		this.setState(prevState=>({
			searching: true,
			resolver: this.props.resolver,
		}), ()=>{
			this.process_entry()
		})	
	}

	componentDidUpdate = (prevProps) => {
		const prev_search = decodeURI(prevProps.location.search)
		const curr_search = decodeURI(this.props.location.search)
		if (prevProps.id !== this.props.id){
			this.setState({
				searching: true,
				filters: {},
				childTab: null,
				paginate: (this.props.location.state || {}).paginate ? true: false
			}, ()=>{
				this.process_entry()
			})
		} else if (prev_search !== curr_search){
			this.setState({
				searching: true,
				paginate: (this.props.location.state || {}).paginate ? true: false
			}, ()=>{
				this.process_children()
			})
		}
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
	
	ChildComponent = () => {
		if (this.state.children === null) return null
		if (this.state.children_count === undefined) return <CircularProgress />
		const entry_name = (this.state.entry.info.name || {}).text || this.props.match.params.id
		let children_name = this.props.preferred_name[this.state.entry_object.child_model].toLowerCase()
		const count = this.state.children_count[this.state.childTab] || 0
		let label
		if ((this.props.nav.MetadataSearch.props.metadata_page[this.props.model] || {}).child_text !== undefined){
			const child_text = this.props.nav.MetadataSearch.props.metadata_page[this.props.model].child_text
			const values = {
				name: entry_name,
				count
			}
			label = makeTemplate(child_text, values)
		}else if (this.props.model === "signatures"){
			if (this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) children_name = `${this.state.childTab} ${children_name}`
			label = `${entry_name} has ${count} ${children_name}.`
		}else if (this.props.model === "libraries") {
			label = `There are ${count} ${children_name} in ${entry_name}.`
		}else if (this.props.model === "resources") {
			label = `There are ${count} ${children_name} in ${entry_name}.`
		} else {
			// if (this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) children_name = `${this.state.childTab} ${children_name}`
			label = `There are ${count} ${children_name} that contains ${entry_name}`
			if (this.state.childTab !== null && this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) {
				const vowelRegex = '^[aieouAIEOU].*'
				let article = "a"
				if(this.state.childTab.match(vowelRegex)){
					article = "an"
				}
				label = label + ` as ${article} ${this.state.childTab} ${this.props.preferred_name_singular[this.state.entry_object.model].toLowerCase()}`
			}
			label = label+"."
		}
		return(
			<Grid container spacing={1}>
				{this.state.childTabs.length === 1 ? null:
					<Grid item xs={12} md={8} lg={9}>
						<ResultsTab
							tabs={this.state.childTabs}
							value={this.state.childTab}
							handleChange={this.onChildTabChange}
							tabsProps={{
								centered: true,
							}}
						/>
					</Grid>
				}
				<Grid item xs={12}>
					<SearchResult
						searching={this.state.searching}
						search_terms={this.state.query.search || []}
						search_examples={[]}
						filters={Object.values(this.state.filters)}
						onSearch={this.onSearch}
						onFilter={this.onClickFilter}
						entries={this.state.children[this.state.childTab] || []}
						label={label}
						DataTableProps={{
							onChipClick: v=>{
								if (v.clickable) this.onClickFilter(v.field, v.text)
							}
						}}
						PaginationProps={{
							page: this.state.page,
							rowsPerPage: this.state.perPage,
							count:  this.state.children_count[this.state.childTab],
							onChangePage: (event, page) => this.handleChangePage(event, page),
							onChangeRowsPerPage: this.handleChangeRowsPerPage,
						}}
						schema={this.state.entry.schema}
					/>
				</Grid>
			</Grid>
		)
	}

	pageTitle = () => {
		if (this.state.parent === undefined)
			return (
				<React.Fragment>
					<Typography variant="h4">
						{this.state.entry.info.name.text}
					</Typography>
				</React.Fragment>
			)
		const endpoint = `#/${this.props.preferred_name[this.state.entry_object.parent_model]}/${this.state.parent.data.id}`
		return(
			<React.Fragment>
				<Typography variant="h4">
					{this.state.entry.info.name.text}
				</Typography>
				<Typography variant="h5" gutterBottom>
				<Link href={endpoint}>
					{this.state.parent.info.name.text}
				</Link>
				</Typography>
			</React.Fragment>
		)
	}

	handleMetaTabChange = (event, metaTab) => {
		this.setState({
			metaTab
		})
	}

	metaTab = () => {
		const entry = this.state.entry
		if (this.props.model === "entities") return null
		return (
			<ShowMeta
				value={entry.data.meta}
			/>
		)
	}

	render = () => {
		if (this.state.entry==null){
			return <CircularProgress />
		}
		return(
			<Grid container spacing={3}>
				{this.props.topComponents!==undefined ? 
					<Grid item xs={12}>
						{this.props.topComponents()}
					</Grid> : null}
				<Grid item md={1} xs={4} align="center">						
					<IconComponent
						{...(this.state.entry.info.icon || {})}
					/>
				</Grid>
				<Grid item md={11} xs={8}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							{ this.pageTitle() }
						</Grid>
						<Grid item xs={12}>
							{this.metaTab()}
						</Grid>
					</Grid>
				</Grid>
				{this.props.middleComponents!==undefined ? 
					<Grid item xs={12}>
						{this.props.middleComponents()}
					</Grid> : null}
				<Grid item xs={12}>
					{this.ChildComponent()}
				</Grid>
				{this.props.bottomComponents!==undefined ? 
					<Grid item xs={12}>
						{this.props.bottomComponents()}
					</Grid> : null}
			</Grid>
		)
	}
}

MetadataPage.propTypes = {
	model: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
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
	})
}