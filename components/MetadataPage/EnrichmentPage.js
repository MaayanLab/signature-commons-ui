import React from 'react'
import Grid from '@material-ui/core/Grid'
import Collapse from '@material-ui/core/Collapse'
import Tooltip from '@material-ui/core/Tooltip'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import {ShowMeta} from '../DataTable'
import CircularProgress from '@material-ui/core/CircularProgress'

import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import IconButton from '../IconButton'
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button'
import { SearchResult } from './SearchResult'
import { get_filter,
	resolve_ids,
	get_signature_entities,
	create_query,
	enrichment,
	download_signature,
	get_data_for_bar_chart
 } from '../Search/utils'
import ScorePopper from '../ScorePopper'
import Downloads from '../Downloads'
import {EnrichmentBar} from './EnrichmentBar'
import {ScatterPlot} from './ScatterPlot'
import Lazy from '../Lazy'

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { LinearProgress } from '@material-ui/core'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination'


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
			expanded: false,
		}
	}

	handleExpandClick = () => {
		this.setState(prevState=>({
			expanded: !prevState.expanded,
		}));
	  }

	process_entry = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()

			const { type, model_name, enrichment_id, id } = this.props.match.params
			const { lib_to_resource, resource_to_lib } = this.props.resource_libraries
			const {model, schemas, nav, preferred_name} = this.props
			
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
			const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas,
										`#/Enrichment/${type}/${enrichment_id}/${model_name}/id`)
			const parent = labelGenerator(await entry_object.parent(), schemas, 
										`#/Enrichment/${type}/${enrichment_id}/${preferred_name[entry_object.parent_model]}/`)
			await entry_object.create_search_index(entry.schema, entry_object.child_model==='signatures')
			
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
				const query = create_query(input, enrichment_id)
				// TODO: Enrichment should only be done on the library it belongs to
				await enrichment(query, input, this.props.resolver, this.handleError)
			}
		} catch (error) {
			console.error(error)
		}
	}

	process_children = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {schemas} = this.props
			const { type, enrichment_id } = this.props.match.params
			const {entry_object} = this.state
			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const {limit= 10,
				skip= 0,
				order= [this.state.order_field, this.state.order],
				} = query
			const final_query = {
				limit, skip, order,
				search: query.search
			}
			const children_object = await this.state.entry_object.children(final_query)
			const children_count = children_object.count
			const children_results = children_object[this.state.entry_object.child_model]
			const children = []
			for (const entry of Object.values(children_results)){
				let e
				if (entry_object.child_model!=="entities"){
					e = labelGenerator(entry,
						schemas,
						`#/Enrichment/${type}/${enrichment_id}/${this.props.preferred_name[entry_object.child_model]}/`)
				}else {
					e = labelGenerator(entry, schemas)
				}
				e["RightComponents"] = []
				if (entry.scores !== undefined && entry.scores.signature_count !== undefined){
					e["RightComponents"].push({
						component: this.score_popper,
						props: {
							scores: {"Enriched Terms": {
								label: "Enriched Terms",
								value: entry.scores.signature_count
							}},								
							GridProps: {
								style: {
									textAlign: "right",
									marginRight: 5
								}
							}
						}
					})
				}
				if (entry_object.child_model==='signatures'){
					e.RightComponents.push({
						component: this.downloads,
						props: {
							data: [
								{
									text: `Download Overlaps as a text file`,
									onClick: () => {
										download_signature({
											entry,
											schemas,
											filename: `${e.info.name.text}.txt`,
											resolver: this.props.resolver,
											model: entry_object.child_model,
										})
									},
									icon: "mdi-note-text-outline"
								},
								{
									text: `Download Overlaps as JSON`,
									onClick: () => {
										download_signature({
											entry,
											schemas,
											filename: `${e.info.name.text}.txt`,
											resolver: this.props.resolver,
											model: entry_object.child_model,
											serialize: true
										})
									},
									icon: "mdi-json"
								}
							]
						}
					})
				}	
				children.push(e)
			}
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
			console.log("not here")
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
			label = `The input ${this.props.preferred_name_singular.signatures.toLowerCase()} has ${count} overlapping ${children_name} with ${entry_name}`
		}else if (this.props.model === "libraries") {
			label = `There are ${count} enriched terms in ${entry_name}`
		}else if (this.props.model === "resources") {
			label = `There are ${count} ${children_name} in ${entry_name} with ${this.state.entry.data.scores.signature_count} enriched terms`
		}
		return(
			<React.Fragment>
				<SearchResult
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
						}
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

	handleMetaTabChange = (event, metaTab) => {
		this.setState({
			metaTab
		})
	}

	metaTab = () => {
		const entry = this.state.entry
		return (
			<React.Fragment>
				<ShowMeta
					value={entry.data.meta}
				/>
				<ShowMeta
					value={entry.data.scores}
				/>
			</React.Fragment>
		)
	}

	enrichment_bar = () => {
		const {
			barColor="#0063ff",
			inactiveColor="#713939"
		} = this.props
		const data= get_data_for_bar_chart({
			entries: this.state.children,
			barColor,
			inactiveColor,
			order: this.state.order,
			order_field: this.state.order_field,
		})
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

	scatter_plot = async () => {
		const {
			scatterColor="#0063ff",
			inactiveColor="#713939"
		} = this.props
		const {signatures} = await this.state.entry_object.children({limit:0})
		const data = signatures.map(s=>({
			name: getName(s, this.props.schemas),
			id: s.id,
			oddsratio: s.scores["odds ratio"],
			logpval: -Math.log(s.scores["p-value"]),
			pval: s.scores["p-value"], 
			color: s.scores["p-value"] < 0.05 ? scatterColor: inactiveColor,
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
		if (this.state.entry_object === null || this.state.entry_object.model !== 'libraries' ) return null
		if (this.state.searching) return <div style={{height: 400, textAlign: "center"}}><CircularProgress/></div>
		if (this.state.children.length === 0) return null
		const visuals = {
			bar:  this.enrichment_bar,
			scatter: () => <Lazy>{async () => this.scatter_plot()}</Lazy>,
			table: this.table_view
		}
		return (
			<Grid container spacing={1}>
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

	table_view = () => {
		const {entries, head_cells} = this.render_table_data()
		const PaginationProps = {
			page: this.state.page,
			rowsPerPage: this.state.perPage,
			count:  this.state.children_count[this.state.tab],
			onChangePage: (event, page) => this.handleChangePage(event, page),
			onChangeRowsPerPage: this.handleChangeRowsPerPage,
		}
		return (
			<React.Fragment>
				 <Table aria-label="enrichment table">
				 	<TableHead>
						 {head_cells.map(c=>(
						 <TableCell
							 align={`${c.id==="name" ? "left": "right"}`}
							 key={c.id}
							 onClick={()=>{
								 console.log(c.id)
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
							<Grid container spacing={1}>
								<Grid item md={2} xs={4}>
									<CardMedia style={{ marginTop: -15, paddingLeft: 13 }}>
										<IconButton
											{...(this.state.entry.info.icon || {})}
										/>
									</CardMedia>
								</Grid>
								<Grid item md={10} xs={8}>
									<Grid container spacing={1}>
										<Grid item xs={7} md={9}>
											{ this.pageTitle() }
										</Grid>
										<Grid item xs={5} md={3} align="right">
											{this.state.visualize && this.state.children.length > 0 ?
												<React.Fragment>
													<ToggleButtonGroup
														value={this.state.visualization}
														exclusive
														onChange={(e, visualization)=>{
															this.setState({visualization})
														}}
														aria-label="text alignment"
													>
														<ToggleButton value="bar" aria-label="bar">
															<span className="mdi mdi-chart-bar mdi-rotate-90 mdi-24px"/>
														</ToggleButton>
														<ToggleButton value="scatter" aria-label="scatter">
															<span className="mdi mdi-chart-scatter-plot mdi-24px"/>
														</ToggleButton>
														<ToggleButton value="table" aria-label="table">
															<span className="mdi mdi-table mdi-24px"/>
														</ToggleButton>
													</ToggleButtonGroup>
												</React.Fragment>: null
											}
											<Tooltip title={`${this.state.expanded ? "Collapse": "View"} ${this.props.preferred_name_singular[this.props.model]} information`}>
												<Button onClick={this.handleExpandClick}>
													<span className={`mdi mdi-24px mdi-chevron-${this.state.expanded ? "up": "down"}`}/>
												</Button>
											</Tooltip>
										</Grid>
										<Grid item xs={12}>
											<Collapse in={this.state.expanded} timeout="auto" unmountOnExit>											
												{this.metaTab()}
											</Collapse>
										</Grid>
									</Grid>
								</Grid>
								<Grid item xs={12}>
									{this.visualizations()}
								</Grid>
								<Grid item xs={12} align="right">
								<Tooltip title={"Go Back to search results"}>
									<Button href={this.state.back_endpoint}>
										<span className="mdi mdi-arrow-left-bold mdi-24px"/>
									</Button>
								</Tooltip>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
				{this.props.middleComponents!==undefined ? 
					<Grid item xs={12}>
						{this.props.middleComponents()}
					</Grid> 
					: null}
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