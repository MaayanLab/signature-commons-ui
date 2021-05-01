import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import {ShowMeta} from '../DataTable'
import {build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import IconButton from '../IconButton'
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { SearchResult } from './SearchResult'
import { get_filter, resolve_ids, download_signature } from '../Search/utils'
import Downloads from '../Downloads'
import Options from '../Search/Options'
import {ResultsTab} from './ResultsTab'

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

	download = (props) => {
		return <Downloads {...props}/>
	}

	options = (props) => {
		return <Options {...props}/>
	}

	process_entry = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {model, id, schemas} = this.props
			// const skip = limit*page
			const {resolved_entries} = await this.props.resolver.resolve_entries({model, entries: [id]})
			const entry_object = resolved_entries[id]
			
			const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas,
										"#/" + this.props.preferred_name[entry_object.model] +"/")
			const parent = labelGenerator(await entry_object.parent(), schemas, "#/" + this.props.preferred_name[entry_object.parent_model] +"/")
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
				for (const entry of Object.values(v)){
					const e = labelGenerator(entry,
						schemas,
						"#" + this.props.preferred_name[this.state.entry_object.child_model] +"/")
					e.RightComponents = []
					if (e.info.components.options !== undefined) {
						e.RightComponents.push({
							component: this.options,
							props: {...e.info.components.options.props}
						})
					} 
					if (e.info.download !== undefined) {
						e.RightComponents.push({
							component: this.download,
							props: {...e.info.download.props}
						})
					} 
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
				const value_count = await this.props.resolver.aggregate(
					`/${this.state.entry_object.model}/${this.state.entry_object.id}/${this.state.entry_object.child_model}/value_count`, 
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
		if (this.props.model === "signatures"){
			if (this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) children_name = `${this.state.childTab} ${children_name}`
			label = `${entry_name} has ${count} ${children_name}.`
		}else if (this.props.model === "libraries") {
			label = `There are ${count} ${children_name} in ${entry_name}.`
		}else if (this.props.model === "resources") {
			label = `There are ${count} ${children_name} in ${entry_name}.`
		} else {
			// if (this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) children_name = `${this.state.childTab} ${children_name}`
			label = `There are ${count} ${children_name} that contains ${entry_name}`
			if (this.state.childTab !== undefined && this.state.childTab !== this.state.entry_object.child_model) {
				label = label + ` in its ${this.state.childTab} ${this.props.preferred_name[this.state.entry_object.model].toLowerCase()}`
			}
			label = label+"."
		}
		return(
			<React.Fragment>
				{this.state.childTabs.length === 1 ? null:
					<ResultsTab
						tabs={this.state.childTabs}
						value={this.state.childTab}
						handleChange={this.onChildTabChange}
						tabsProps={{
							centered: true,
						}}
					/>
				}
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
			</React.Fragment>
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
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Grid container spacing={3}>
								<Grid item md={2} xs={4}>
									<CardMedia style={{ marginTop: -15, paddingLeft: 13 }}>
										<IconButton
											{...(this.state.entry.info.icon || {})}
										/>
									</CardMedia>
								</Grid>
								<Grid item md={10} xs={8}>
									<Grid container spacing={3}>
										<Grid item xs={12}>
											{ this.pageTitle() }
										</Grid>
										<Grid item xs={12}>
											{this.metaTab()}
										</Grid>
									</Grid>
								</Grid>
								{/* <Grid item xs={12}>
									<Divider/>
									
								</Grid> */}
							</Grid>
						</CardContent>
					</Card>
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