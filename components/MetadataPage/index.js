import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import {DataTable, ShowMeta} from '../DataTable'
import {DataResolver, build_where} from '../../connector'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import { findMatchedSchema } from '../../util/ui/objectMatch'
import PropTypes from 'prop-types'
import IconButton from '../../components/IconButton'
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import {ResultsTab} from './ResultsTab'
import { makeTemplate, makeTemplateObject } from '../../util/ui/makeTemplate' 
import { fetch_external } from '../../util/fetch/fetch_external'
import { SearchResult } from './SearchResult'

const external = [
	{
		url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${meta.Gene_ID}&retmode=json",
		type: "meta",
		model: "entities",
		error: "${result[result.uids[0]].error === 'cannot get document summary'}",
		field: "result[${meta.Gene_ID}]",
		label: "NCBI Gene",
	},
	{
		url: "https://maayanlab.cloud/Harmonizome/api/1.0/gene/${meta.Name}",
		type: "meta",
		model: "entities",
		error: "${status===400}",
		label: "Harmonizome",
	}
]
export const get_filter = (filter_string) => {
	try {
		filter_string = decodeURI(filter_string).replace("?filter=","")
		return JSON.parse(filter_string)	
	} catch (error) {
		return {limit:10}
	}
	
}

export default class MetadataPage extends React.PureComponent {
	constructor(props){
		super(props)
		// query = {
		// 	search: [],
		// 	filters: {
		// 		[field]: []
		// 	},
		// 	order: [],
		// 	limit: int,
		// 	skip: int
		// }
		this.state = {
			search_terms: [],
			resolver: new DataResolver(),
			entry: null,
			page: 0,
			perPage: 10,
			metaTab: "metadata",
			query: {skip:0, limit:10},
			filters: {},
			paginate: false
		}
	}

	process_entry = async () => {
		this.state.resolver.abort_controller()
		this.state.resolver.controller()
		const {model, id, schemas} = this.props
		// const skip = limit*page
		const {resolved_entries} = await this.state.resolver.resolve_entries({model, entries: [id]})
		const entry_object = resolved_entries[id]
		
		const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas,
									"#/" + this.props.preferred_name[entry_object.model] +"/")
		const parent = labelGenerator(await entry_object.parent(), schemas, "#/" + this.props.preferred_name[entry_object.parent_model] +"/")
		const meta = {
			metadata: entry.data.meta
		}
		this.setState({
			entry_object,
			entry,
			parent,
			meta
		}, ()=> {
			this.process_children()
		})
	}

	process_children = async () => {
		this.state.resolver.abort_controller()
		this.state.resolver.controller()
		const {schemas} = this.props
		const {search: filter_string} = this.props.location
		const query = get_filter(filter_string)
		const where = build_where(query)
		console.log(where)
		const {limit=10, skip=0, order} = query
		// const skip = limit*page
		const q = {
			limit, skip, order
		}
		if (where) q["where"] = where
		const children_object = await this.state.entry_object.children({...q})
		const children_count = children_object.count
		const children_results = children_object[this.state.entry_object.child_model]
		const children = Object.values(children_results).map(c=>labelGenerator(c, schemas, "#/" + this.props.preferred_name[this.state.entry_object.child_model] +"/"))
		if (!this.state.paginate) this.get_value_count(where, query)	
		this.setState({
			children_count,
			children,
			tab: this.props.label || Object.keys(children_count)[0],
			page: skip/limit,
			perPage: limit,
			query,
			searching: false,
			paginate: false,
		})	
	}


	get_value_count = async (where, query) =>{
		const filter_fields = {}
		const fields = []
		for (const prop of Object.values(this.state.entry.schema.properties)){
			if (prop.type === "filter"){
				const checked = {}
				if ((query.filters || {})[prop.field]){
					for (const i of query.filters[prop.field]){
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
				fields.push(prop.field)
			}
		}
		if (fields.length > 0){
			const value_count = await this.state.resolver.aggregate(
				`/${this.state.entry_object.model}/${this.state.entry_object.id}/${this.state.entry_object.child_model}/value_count`, 
				{
					where,
					fields,
					limit: 20,
				})
			const filters = {}
			for (const [field, values] of Object.entries(value_count)){
				filters[field] = {
					...filter_fields[field],
					values
				}
			}
			
			this.setState({
				filters
			})
		}
	}

	onClickFilter = (field, value) => {
		const {filters} = this.state
		filters[field].checked[value] = filters[field].checked[value] === undefined ? true : !filters[field].checked[value]
		const search_field = filters[field].search_field
		const checked = filters[field].checked
		const query = {
			...this.state.query,
			filters: {
				...filters,
				[search_field]: Object.keys(checked).filter(k=>checked[k])				}
		}
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?filter=${JSON.stringify(query)}`,
			})
	}

	componentDidMount = () => {
		this.setState({
			searching: true,
		}, ()=>{
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

	handleTabChange = (event, tab) => {
		this.setState({
			tab
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
			search: `?filter=${JSON.stringify(query)}`,
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
				search: `?filter=${JSON.stringify(query)}`,
			})
		})
	}

	ChildComponent = () => {
		if (this.state.children_count === undefined) return <CircularProgress />
		const tabs = Object.entries(this.state.children_count).map(([k,count])=>{
			const label = this.props.preferred_name[k] || k
			return {
				label,
				href: this.props.location.pathname + `/${label}`,
				count,
				value: k
			}
		})
		return(
			<React.Fragment>
				<SearchResult
					searching={this.state.searching}
					search_terms={this.state.query.search || []}
					search_examples={[]}
					filters={Object.values(this.state.filters)}
					onSearch={this.onSearch}
					onFilter={this.onClickFilter}
					entries={this.state.children}
					PaginationProps={{
						page: this.state.page,
						rowsPerPage: this.state.perPage,
						count:  this.state.children_count[this.state.tab],
						onChangePage: (event, page) => this.handleChangePage(event, page),
						onChangeRowsPerPage: this.handleChangeRowsPerPage,
					}}
					TabProps={{
						tabs,
						value:this.state.tab,
						handleChange:this.handleTabChange,
						tabsProps:{
							centered: true
						},
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

	metaTabs = () => {
		const meta = this.state.meta
		if (Object.keys(meta).length === 1) {
			return (
				<ShowMeta
					value={meta[this.state.metaTab]}
				/>
			)
		} else {			
			const tabs = Object.keys(this.state.meta).map((label)=>{
				return {
					label,
					href: "#",
					value: label
				}
			})
			return (
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<ResultsTab
							tabs={tabs}
							value={this.state.metaTab}
							handleChange={this.handleMetaTabChange}
						/>
					</Grid>
					<Grid item xs={12}>
						<ShowMeta
							value={meta[this.state.metaTab]}
						/>
					</Grid>
				</Grid>	
			)
		}
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
											{this.metaTabs()}
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
}