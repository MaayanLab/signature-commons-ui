import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import CircularProgress from '@material-ui/core/CircularProgress'

import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { EnrichmentResult } from './EnrichmentResult'
import { get_filter,
	get_signature_entities,
	create_query,
	enrichment,
	download_enrichment_for_library,
 } from '../Search/utils'
import ScorePopper from '../ScorePopper'
import Downloads from '../Downloads'
import {EnrichmentBar} from './EnrichmentBar'
import {ScatterPlot} from './ScatterPlot'
import Lazy from '../Lazy'
import { LinearProgress } from '@material-ui/core'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination'
import { precise } from '../ScorePopper'
import Color from 'color'

import LibraryEnrichment from './LibraryEnrichment'
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';

const id_mapper = {
	resources: "resource_id",
	libraries: "library_id",
	signatures: "signature_id",
}

export default class EnrichmentPage extends React.PureComponent {
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
			visualization: "bar",
			visualize: false,
			expanded: null,
			downloading: false,
			error: null,
		}
	}

	handleExpandClick = (expanded) => {
		if (expanded === this.state.expanded) expanded = null
		setTimeout(function () {
			window.scrollTo({top: 0, behavior: 'smooth'})
		},1)
		const entries = this.state.children
		const children = this.process_children_values(entries, this.state.entry_object.child_model, expanded)
		this.setState({
			expanded,
			children});
	  }

	process_entry = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()

			const { type, model_name, enrichment_id, id: match_id } = this.props.match.params
			const { lib_to_resource, resource_to_lib } = this.props.resource_libraries
			const {model, schemas, nav, preferred_name} = this.props
			const id = match_id || this.props.id
			await this.process_enrichment_id()
			const entry_object = await this.props.resolver.resolve_enrichment({
				enrichment_id,
				[id_mapper[model]]: id,
				lib_to_resource,
				resource_to_lib,
			})
			let order_field, order
			if (entry_object.child_model === "signatures"){
				order_field = 'p-value'
				order = 'ASC'
			}else if (entry_object.child_model !== "entities"){
				order_field = 'signature_count'
				order = 'DESC'
			}
			const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas)
			const parent = labelGenerator(await entry_object.parent(), schemas, 
										`#/Enrichment/${type}/${enrichment_id}/${preferred_name[entry_object.parent_model]}/`)
			// await entry_object.create_search_index(entry.schema, entry_object.child_model==='signatures')
			let back_endpoint
			if (model==='signatures') {
				back_endpoint = `#${nav.SignatureSearch.endpoint}/${type}/${enrichment_id}/${preferred_name.resources}/${entry.data.library.resource.id}`
			}else if (model==='libraries') {
				back_endpoint = `#${nav.SignatureSearch.endpoint}/${type}/${enrichment_id}/${preferred_name.resources}/${entry.data.resource.id}`
			}else if (model==='resources') {
				back_endpoint = `#${nav.SignatureSearch.endpoint}/${type}/${enrichment_id}/${preferred_name.resources}/${entry.data.id}`
			}
			
			this.setState({
				entry_object,
				entry,
				parent,
				order_field,
				order,
				back_endpoint
			}, ()=> {
				this.process_children()
			})	
		} catch (error) {
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "process_entry error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
		}
	}

	process_enrichment_id = async () => {
		try {
			const { type, model_name, enrichment_id, id } = this.props.match.params
			const e = this.props.resolver.get_enrichment(enrichment_id)
			if (e === undefined) {
				// try if it is a signature
				const input = await get_signature_entities(enrichment_id, this.props.resolver, this.props.schemas, this.handleError)
				if (input === null) throw new Error("Invalid Enrichment ID")
				else {
					const query = create_query(input, enrichment_id)
					// TODO: Enrichment should only be done on the library it belongs to
					await enrichment(query, input, this.props.resolver, this.handleError)
				}
			}
		} catch (error) {
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "process_enrichment_id error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
		}
	}

	process_children_values = (entries, child_model, expanded) => {
		const children = []
		for (const entry of entries){
			let e
			if (entry.data){
				e = entry
			}else if (child_model!=="entities"){
				e = labelGenerator(entry,
					this.props.schemas)
			}else {
				e = labelGenerator(entry, this.props.schemas)
			}
			e["RightComponents"] = [{
				component: (props)=>(
					<Tooltip title={props.text}>
						<IconButton aria-label="table" size="small" onClick={props.onClick}>
							<span className={`mdi ${props.icon}`}
							/>
						</IconButton>
					</Tooltip>
				),
				props: {
					icon: expanded === e.data.id ? "mdi-24px mdi-table-eye-off": "mdi-24px mdi-table-eye",
					text: expanded === e.data.id ? "Hide Table": "Show Table",
					onClick: () => this.handleExpandClick(e.data.id),
				}
			}]
			e.BottomComponents = [{
				component: (props) => <LibraryEnrichment {...props}/>,
				props: {
					...this.props,
					id: e.data.id,
					expanded: expanded === e.data.id
				}
			}]

			children.push(e)
		}
		return children
	}

	process_children = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {entry_object} = this.state
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const {limit=0,
				skip=0,
				order=[this.state.order_field, this.state.order],
				} = query
			const final_query = {
				limit, skip, order,
				search: query.search
			}
			const children_object = await this.state.entry_object.children(final_query)
			const children_count = children_object.count
			const children_results = children_object[this.state.entry_object.child_model]
			const children = this.process_children_values(Object.values(children_results), this.state.expanded)
			
			// if (!this.state.paginate) this.get_value_count(where, query)
			this.setState({
				children_count,
				children,
				page: skip/limit,
				perPage: limit,
				query,
				searching: false,
				paginate: false,
				visualize: entry_object.child_model === 'signatures',
				tab: this.props.label || Object.keys(children_count)[0],
			})	
		} catch (error) {
			console.error(error)
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "process_children error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
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
				const value_count = await this.props.resolver.aggregate_post({
					endpoint: `/${this.state.entry_object.model}/${this.state.entry_object.id}/${this.state.entry_object.child_model}/value_count`, 
					filter: {
						where,
						fields,
						limit: 20,
					}
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
			this.setState(prevState=>{
				if (prevState.error === null) {
					return {
						error: "get_value_count error: " + error.message
					}
				} else return {
					error: prevState.error
				}
			})
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

	handleError = (error) => {
		this.setState({
			error: error.message
		})
	}

	downloads = (props) => {
		return <Downloads {...props}/>
	}

	componentDidMount = () => {
		this.setState(prevState=>({
			searching: true,
			resolver: this.props.resolver !== undefined ? this.props.resolver: new DataResolver(),
			children: undefined
		}), ()=>{
			this.process_entry()
		})	
	}

	score_popper = (props) => {
		return <ScorePopper {...props} sortBy={this.sortBy}/>
	}
	
	sortBy = (order_field) => {
		this.setState(prevState=>{
			if (prevState.order_field !== order_field) {
				return{
					order_field,
					order: order_field === 'odds ratio' ? 'DESC': 'ASC',
					visualize: false,
					searching: true,
				}
			} else {
				return{
					order: prevState.order === 'ASC' ? 'DESC': 'ASC',
					visualize: false,
					searching: true,
				}
			}
		}, ()=>{
			this.process_children()
		})
	}

	componentDidUpdate = (prevProps, prevState) => {
		const prev_search = decodeURI(prevProps.location.search)
		const curr_search = decodeURI(this.props.location.search)
		if (prevProps.match.params.id !== this.props.match.params.id){
			this.setState({
				entry_object: null,
				searching: true,
				filters: {},
				visualize: false,
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
		// if (prevState.expanded !== this.state.expanded){
		// 	window.scrollTo({
		// 		top: 0,
		// 		left: 0,
		// 		behavior: 'smooth'
		// 	  })
		// }
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
			search,
			skip: 0
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
		if (this.state.children_count === undefined || this.state.entry_object === null) return <LinearProgress />
		const entry_name = (this.state.entry.info.name || {}).text || this.props.match.params.id
		const children_name = this.props.preferred_name[this.state.entry_object.child_model].toLowerCase()
		const count = this.state.children_count[this.state.entry_object.child_model]
		let label
		if (this.props.model === "signatures"){
			if ((this.state.entry.data.library || {}).dataset_type === "rank_matrix") return null
			label = `The input ${this.props.preferred_name_singular.signatures.toLowerCase()} has ${count} overlapping ${children_name} with ${entry_name}`
		}else if (this.props.model === "libraries") {
			if (count === 100) label = `Top ${count} enriched terms in ${entry_name}`
			else label = `There are ${count} enriched terms in ${entry_name}`
		}else if (this.props.model === "resources") {
			label = `Top enriched terms from ${count} ${children_name} in ${entry_name}`
		}
		return(
			<Grid container>
				<Grid item xs={12} style={{margin: "10px 20px"}}>
					<EnrichmentResult
						searching={this.state.searching}
						search_terms={this.state.query.search || []}
						search_examples={[]}
						label={label}
						filters={Object.values(this.state.filters)}
						onSearch={this.onSearch}
						onFilter={this.onClickFilter}
						entries={this.state.children}
						DataTableProps={{
							onChipClick: v=>{
								if (v.field.includes('scores.')) this.sortBy(v.field.replace('scores.',''))
							},
							expanded: this.state.expanded
						}}
						PaginationProps={{
							page: this.state.page,
							rowsPerPage: this.state.perPage,
							count:  this.state.children_count[this.state.tab],
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
		const endpoint = this.state.parent.info.endpoint 
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

	lazy_tooltip = async (payload) => {
		const {name, id, oddsratio, pval, setsize, zscore} = payload
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
					<Typography><b>p-value:</b> {precise(pval)}</Typography>
					{ oddsratio !==undefined ?
						<Typography><b>odds ratio:</b> {precise(oddsratio)}</Typography>:
						null
					}
					{ zscore !==undefined ?
						<Typography><b>z score:</b> {precise(zscore)}</Typography>:
						null
					}
					{ setsize ?
						<React.Fragment>
							<Typography><b>overlap size:</b> {setsize}</Typography>
							<Typography><b>overlaps:</b> {overlap_text}</Typography>
						</React.Fragment>: null
					}
				</CardContent>
			</Card>
		)
	}

	bar_data_set_to_set = () => {
		const {
			barColor="#0063ff",
			inactiveColor="#713939"
		} = this.props
		const {
			children,
			order,
			order_field,
		} = this.state
		const color = Color(barColor)
		const data = []
		const f = children[0].data.scores[order_field]
		const firstVal = order === 'DESC' ? f: -Math.log(f)
		for (const c of children){
			const v = c.data.scores[order_field]
			const value = order === 'DESC' ? v: -Math.log(v)
			const col = color.lighten(-((value/firstVal) - 1))
			const entry = c.data
			const d = {
				name: c.info.name.text,
				value,
				color: (entry.scores["p-value"] < 0.05 && entry.scores["overlap size"] > 1) ? col.hex(): inactiveColor,
				id: entry.id,
				oddsratio: entry.scores["odds ratio"],
				pval: entry.scores["p-value"], 
				setsize: entry.scores["overlap size"],
				tooltip_component: this.lazy_tooltip,
			}	
			data.push(d)		
		}
		const score_fields = Object.keys(this.state.children[0].data.scores).filter(s=>s!=="setsize")
		return (
			<React.Fragment>
				<EnrichmentBar data={data} field={this.state.order_field} fontColor={"#FFF"} 
					barProps={{isAnimationActive:false}}
					barChartProps={{
						onClick: () => {
							const new_index = (score_fields.indexOf(this.state.order_field) + 1)%score_fields.length
							const new_field = score_fields[new_index]
							this.sortBy(new_field)
						}
					}}/>
				<Typography>Click the bars to sort. Now sorted by {this.state.order_field}.</Typography>
			</React.Fragment>
		)
	}

	bar_data_set_to_rank = async () => {
		const {
			posBarColor="#0063ff",
			negBarColor="#FF2A43",
			inactiveColor="#713939"
		} = this.props
		const {
			entry_object,
			order,
			order_field,
		} = this.state
		const posColor = Color(posBarColor)
		const negColor = Color(negBarColor)

		const {signatures} = await this.state.entry_object.children({limit:0, order: [order_field, order]})
		const up_data = []
		const down_data = []
		const count = {up: 0, down: 0, total: 0}
		let firstValUp
		let firstValDown
		for (const entry of signatures){
			const v = entry.scores[order_field]
			const value = order === 'DESC' ? v: -Math.log(v)
			const direction = entry.scores["direction"]
			let col
			if (direction === "up" && count.up < 10){
				if (firstValUp === undefined) {
					firstValUp = value
					col = posColor
				}else {
					col = posColor.lighten(-((value/firstValUp) - 1))
				}
				const d = {
					name: getName(entry, this.props.schemas),
					value,
					color: entry.scores["p-value"] < 0.05 ? col.hex(): inactiveColor,
					id: entry.id,
					pval: entry.scores["p-value"],
					zscore: entry.scores["zscore"], 
					tooltip_component: this.lazy_tooltip,
				}	
				up_data.push(d)
				count.up = count.up + 1
				count.total = count.total + 1		
			} else if (direction === "down" && count.down < 10) {
				if (firstValDown === undefined) {
					firstValDown = value
					col = negColor
				}else {
					col = negColor.lighten(-((value/firstValDown) - 1))
				}
				const d = {
					name: getName(entry, this.props.schemas),
					value,
					color: entry.scores["p-value"] < 0.05 ? col.hex(): inactiveColor,
					id: entry.id,
					pval: entry.scores["p-value"],
					zscore: entry.scores["zscore"],  
					tooltip_component: this.lazy_tooltip,
				}	
				down_data.push(d)
				count.down = count.down + 1
				count.total = count.total + 1	
			}
			if (count.total === 20) break	
		}
		return (
			<Grid container style={{marginLeft: 20, marginRight: 20}}>
				<Grid item xs={12} md={6}>
					<EnrichmentBar data={down_data} field={this.state.order_field} fontColor={"#FFF"} 
						barProps={{isAnimationActive:false}}
						barChartProps={{
							width: 500
						}}
					/>
					<Typography>Down</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<EnrichmentBar data={up_data} field={this.state.order_field} fontColor={"#FFF"} 
						barProps={{isAnimationActive:false}}
						barChartProps={{
							width: 500
						}}
					/>
					<Typography>Up</Typography>
				</Grid>
				
			</Grid>
		)

	}
	
	enrichment_bar = async () => {
		if (this.state.entry.data.dataset_type === "geneset_library"){
			return this.bar_data_set_to_set()
		} else return await this.bar_data_set_to_rank()
	}

	scatter_plot = async () => {
		const {
			scatterColor="#0063ff",
			inactiveColor="#713939"
		} = this.props
		const {signatures} = await this.state.entry_object.children({limit:0})
		const data = signatures.map(entry=>(
			{
				name: getName(entry, this.props.schemas),
				id: entry.id,
				oddsratio: entry.scores["odds ratio"],
				logpval: -Math.log(entry.scores["p-value"]),
				pval: entry.scores["p-value"], 
				setsize: entry.scores["overlap size"],
				tooltip_component: this.lazy_tooltip,
				color: (entry.scores["p-value"] < 0.05 && entry.scores["overlap size"] > 1) ? scatterColor: inactiveColor
			}))
		return (
			<React.Fragment>
				<ScatterPlot data={data} color={scatterColor} scatterProps={{onClick: (v) => {
					const {type, enrichment_id} = this.props.match.params
					const model = this.props.preferred_name[this.state.entry_object.child_model]
					const id = v.id
					this.props.history.push({
						pathname: `/Enrichment/${type}/${enrichment_id}/${model}/${id}`,
					})
				}}}/>
				<Typography>Hover over a point to view the p-value and odd ratio of an enriched term. Click on a point to view a list of the overlapping {this.props.preferred_name.entities.toLowerCase()}.</Typography>
			</React.Fragment>
		)
	}


	visualizations = () => {
		if (this.state.entry_object === null || this.state.entry_object.model !== 'libraries' || this.state.searching) return null
		if (this.state.children.length === 0) return null
		const visuals = {
			bar:  () => <Lazy>{async () => this.enrichment_bar()}</Lazy>,
			scatter: () => <Lazy>{async () => this.scatter_plot()}</Lazy>,
			table: this.table_view
		}
		return (
			<Grid container spacing={1} style={{height:450}}>
				<Grid item xs={12} align="center">
					{visuals[this.state.visualization]()}
				</Grid>
			</Grid>
		) 
	}

	render_table_data = () => {
		const entries = []
		const head_cells = [
			{ id: 'name', numeric: false, disablePadding: true, label: 'Term' },
		]
		for (const entry of this.state.children) {
			const data = {
				name: entry.info.name.text,
				endpoint: entry.info.endpoint,
			}
			let generate_head_cells = false
			if (head_cells.length === 1) generate_head_cells = true
			for (const tag of entry.info.tags){
				if (tag.field){
					if (tag.field.startsWith("score")) data[tag.field] = parseFloat(tag.text)
					else data[tag.field] = tag.text
					if (generate_head_cells){
						head_cells.push({
							id: tag.field,
							numeric: tag.field.startsWith("score"),
							disablePadding: false,
							label: tag.label
						})
					}
				}
			}
			entries.push(data)
		}
		return {entries, head_cells}
	}

	table_row = (row, header) => {
		const cells = []
		for (const h of header){
			if (h.id === "name"){
				cells.push(
					<TableCell component="th" scope="row" key={row.name}>
						<a href={row.endpoint}>{row[h.id]}</a>
					</TableCell>
				)
			} else {
				cells.push(
					<TableCell align="right" key={`${row.name}-${row[h.id]}`}>{row[h.id]}</TableCell>
				)
			}
		}
		return cells
	}

	start_download = () => {
		this.setState({
			downloading: true
		})
	}

	finish_download = () => {
		this.setState({
			downloading: false
		})
	}

	download_library = async (format) => {
		await download_enrichment_for_library({
			entry: this.state.entry_object,
			filename: `${this.state.entry.info.name.text}${type==="json"?".json":".tsv"}`,
			schemas: this.props.schemas,
			start: this.start_download,
			end: this.finish_download,
			type: this.props.match.params.type,
			format
		})
	}
	table_view = () => {
		const {entries, head_cells} = this.render_table_data()
		const PaginationProps = {
			page: this.state.page,
			rowsPerPage: this.state.perPage,
			count:  this.state.children_count[this.state.tab],
			onChangePage: (event, page) => this.handleChangePage(event, page),
			onChangeRowsPerPage: this.handleChangeRowsPerPage,
		}
		const download_props = {
			data: [
				{
					text: `Download as TSV`,
					onClick: () => {
						this.download_library('tsv')
					},
					icon: "mdi-note-text-outline"
				},
				{
					text: `Download as JSON`,
					onClick: () => {
						this.download_library('json')
					},
					icon: "mdi-code-json"
				}
			]
		}
		return (
			<React.Fragment>
				<div style={{textAlign: 'right'}}>
					<Downloads {...download_props} loading={this.state.downloading}/>
				</div>
				 <Table size="small" aria-label="enrichment table">
				 	<TableHead>
						 {head_cells.map(c=>(
						 <TableCell
							 align={`${c.id==="name" ? "left": "right"}`}
							 key={c.id}
							 onClick={()=>{
								 if (c.id.startsWith("score")){
									 this.sortBy(c.id.replace('scores.',''))
								 }
							 }}
							 style={c.id.startsWith("score") ? {
								cursor: "pointer"
							}: {}}
						>
							 {c.label}
						 </TableCell>
						))}
					 </TableHead>
					 <TableBody>
						 {entries.map(row=>(
							 <TableRow key={row.name}>
								 {this.table_row(row, head_cells)}
							 </TableRow>
						 ))}
					 </TableBody>
				 </Table>
				 <TablePagination
					{...PaginationProps}
					component="div"
					align="right"
				/>
			</React.Fragment>
		)
	}

	handleSnackBarClose = (event, reason) => {
		this.setState({
			error: null,
		}, ()=>{
			console.log(`${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}`)
			this.props.history.push({
				pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}`
			})	
		})
	}

	render = () => {
		if (this.state.entry==null){
			return (
				<React.Fragment>
					<Snackbar open={this.state.error!==null}
						anchorOrigin={{ vertical:"top", horizontal:"right" }}
						autoHideDuration={1000}
						onClose={this.handleSnackBarClose}
						message={this.state.error}
						action={
							<Button size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
								<span className="mdi mdi-close-box mdi-24px"/>
							</Button>
						}
					/>
					<CircularProgress />
				</React.Fragment>
			)
		}
		return(
			<Grid container spacing={3} style={{marginBottom: 10}}>
				<Snackbar open={this.state.error!==null}
					anchorOrigin={{ vertical:"top", horizontal:"right" }}
					autoHideDuration={1000}
					onClose={this.handleSnackBarClose}
					message={this.state.error}
					action={
						<Button size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
							<span className="mdi mdi-close-box mdi-24px"/>
						</Button>
					}
				/>
				{this.props.topComponents!==undefined ? 
					<Grid item xs={12}>
						{this.props.topComponents()}
					</Grid> : null}
				<Grid item xs={12}>
					{this.ChildComponent()}
				</Grid>
			</Grid>
		)
	}
}

EnrichmentPage.propTypes = {
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