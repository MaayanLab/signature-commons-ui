import React from 'react'
import dynamic from 'next/dynamic'
import { withRouter } from "react-router";

import Color from 'color'
import { precise } from '../ScorePopper'

import { findMatchedSchema } from '../../util/ui/objectMatch'
import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import {
	get_signature_entities,
	create_query,
	enrichment,
	download_enrichment_for_library,
 } from '../Search/utils'
import { withTheme } from '@material-ui/core/styles';

import {process_data} from '../Scatter/process_data'
import {Model} from '../../connector/model'

const Snackbar = dynamic(()=>import('@material-ui/core/Snackbar'));
const Button = dynamic(()=>import('@material-ui/core/Button'));
const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Card = dynamic(()=>import('@material-ui/core/Card'));
const CardContent = dynamic(()=>import('@material-ui/core/CardContent'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const TableContainer = dynamic(()=>import('@material-ui/core/TableContainer'));
const Table = dynamic(()=>import('@material-ui/core/Table'));
const TableBody = dynamic(()=>import('@material-ui/core/TableBody'));
const TableCell = dynamic(()=>import('@material-ui/core/TableCell'));
const TableHead = dynamic(()=>import('@material-ui/core/TableHead'));
const TableRow = dynamic(()=>import('@material-ui/core/TableRow'));
const TablePagination = dynamic(()=>import('@material-ui/core/TablePagination'));
const Collapse = dynamic(()=>import('@material-ui/core/Collapse'));
const Downloads = dynamic(()=>import('../Downloads'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const ScatterComponent = dynamic(()=>import('../Scatter'));
const EnrichmentBar = dynamic(async () => (await import('./EnrichmentBar')).EnrichmentBar);
const ScatterPlot = dynamic(async () => (await import('./ScatterPlot')).ScatterPlot);
const ChipInput = dynamic(async () => (await import('../SearchComponents')).ChipInput);
const ResultsTab = dynamic(()=>import('../SearchComponents/ResultsTab'));
const MuiAlert = dynamic(()=>import('@material-ui/lab/Alert'));

const Alert = (props) => {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

class LibraryEnrichment extends React.PureComponent {
	constructor(props){
		super(props)
		this.state={
			order_field: 'p-value',
			order: 'ASC',
			search_terms: [],
			direction: null,
			pagination: {},
			expanded: false,
			visualization: "bar",
			scatter_data: null,
			input_term: '',
			term: '',
			scatter_value_count: null,
			primary_field: null,
			secondary_fields: null,
			scatter_selection: [],
			error: null
		}
	}

	process_enrichment_id = async () => {
		try {
			const { enrichment_id, id } = this.props.match.params
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

	process_entry = async () => {
		try {
			// this.props.resolver.abort_controller()
			this.props.resolver.controller()

			const { type, enrichment_id } = this.props.match.params
			const { lib_to_resource, resource_to_lib } = this.props.resource_libraries
			const {schemas, id} = this.props
			
			await this.process_enrichment_id()
			const entry_object = await this.props.resolver.resolve_enrichment({
				enrichment_id,
				library_id: id,
				lib_to_resource,
				resource_to_lib,
			})
			const entry = labelGenerator(await entry_object.serialize(entry_object.model==='signatures', false), schemas)
			// const parent = labelGenerator(await entry_object.parent(), schemas)
			await entry_object.create_search_index(entry.schema, entry_object.child_model==='signatures')
			const order_field = entry.data.dataset_type === "geneset_library" ? 'p-value': 'log p (Fisher)'
			const order = entry.data.dataset_type === "geneset_library" ? 'ASC': 'DESC'
			
			this.setState({
				entry_object,
				order_field,
				order,
				entry
			}, ()=> {
				this.process_children()
			})	
		} catch (error) {
			console.error(error)
		}
	}

	process_children_data = ({entries}) => {
		const inactiveColor="#9e9e9e"
		let barColor
		if (entries[0].direction === undefined || ["up", "reversers", "-"].indexOf(entries[0].direction) > -1) {
			const {main, dark} = this.props.theme.palette.primaryVisualization
			const col = Color(main)
			barColor =dark
		} else {
			const {main, dark} = this.props.theme.palette.secondaryVisualization
			const col = Color(main)
			barColor = col.isLight() ? dark: main
		}
		const color = Color(barColor)
		const bar_data = []
		const firstVal = this.state.order_field === 'p-value' ? 
			-Math.log(entries[0].scores[this.state.order_field]) : 
			entries[0].scores[this.state.order_field]
		
		const lastVal = this.state.order_field === 'p-value' ? 
			-Math.log(entries[entries.length - 1].scores[this.state.order_field]) : 
			entries[entries.length - 1].scores[this.state.order_field]
		
		const diff = firstVal - lastVal
		let col
		const table_entries = []
		const head_cells = []
		for (const entry of entries){
			const s = entry.scores[this.state.order_field]
			if (isNaN(s) || s === null) {
				throw 'Error: Parameter is not a number!';
			}
			// table
			const e = labelGenerator(entry, this.props.schemas)
			const data = {
				name: e.info.name.text,
				endpoint: e.info.endpoint,
			}
			let generate_head_cells = false
			if (head_cells.length === 0) generate_head_cells = true
			if (generate_head_cells && e.info.name.visibility > 0){
				head_cells.push({
					id: 'name',
					numeric: false,
					disablePadding: false,
					label: e.info.name.label,
					style: {
						padding: "2px 0px 2px 10px"
					}
				})
			}
			for (const tag of e.info.tags.sort((a,b)=>a.priority - b.priority)){
				if (tag.visibility > 0){
					data[tag.label] = tag.text
					if (generate_head_cells){
						head_cells.push({
							id: tag.label,
							numeric: false,
							disablePadding: false,
							label: tag.label,
							style: {
								padding: "2px 0px 2px 10px"
							}
						})
					}
				}
			}
			for (const tag of Object.values(e.info.scores || {}).sort((a,b)=>a.priority - b.priority)){
				if (tag.visibility > 0){
					const v = Number(tag.value)
					data[tag.label] = precise(v)
					if (generate_head_cells){
						head_cells.push({
							id: tag.label,
							numeric: true,
							disablePadding: false,
							label: tag.label,
							style: {
								padding: "2px 0px 2px 10px"
							}
						})
					}
				}
			}
			table_entries.push(data)

			// bar
			const value = this.state.order_field === 'p-value' ? 
				-Math.log(entry.scores[this.state.order_field]) : 
				entry.scores[this.state.order_field]
			if (col === undefined) {
				col = color
			}else {
				col = color.lighten((((firstVal - value)/(diff||1))))
			}
			const d = {
				name: e.info.name.text,
				value: entry.direction === "reversers" && this.props.expanded ? -value: value,
				color: value > -Math.log(0.05) ? col.hex(): inactiveColor,
				actual_value: entry.scores[this.state.order_field],
				id: entry.id,
				direction: entry.direction,
				...entry.scores,
				tooltip_component: this.lazy_tooltip
			}	
			bar_data.push(d)
		}
		return {bar_data, table_entries, head_cells}
	}


	process_children = async (direction=null) => {
		try {
			// this.props.resolver.abort_controller()
			this.props.resolver.controller()
			// const {search: filter_string} = this.props.location
			const {
				search_terms,
				order_field,
				order,
				pagination
			} = this.state
			const final_query = {
				limit: 10, skip: 0, order: [order_field, order],
				search: search_terms
			}
			if (direction){
				final_query.direction = direction
				final_query.limit = pagination[direction].limit || 10
				final_query.skip = pagination[direction].skip || 0
			}
			const {count:children_count, ...children} = await this.state.entry_object.children(final_query)
			// const direction = Object.keys(children_count).filter(k=>children_count[k])[0]
			// const direction_tabs = []
			const children_data = {}
			for (const dir of ["signatures", "up", "down", "reversers", "mimickers"]) {
				if (children_count[dir]){
					if (direction === null) direction = dir
					const processed = this.process_children_data({
						entries: children[dir]
					})
					children_data[dir] = {...processed, direction: dir}
				}
			}
			const child = Object.values(children)[0][0]
			if (this.state.primary_field === null) this.scatter_fields(child)
			
			this.setState({
				children_count,
				children,
				searching: false,
				paginate: false,
				direction,
				children_data,
			})	
		} catch (error) {
			console.error(error)
			if (typeof error === "string"){
				this.setState({
					error: error
				})
			}
		}
			
	}

	initialize_scatter_value_count = async () => {
		if (this.state.scatter_value_count === null){
			const scatter_value_count = await this.get_top_value_count('', this.state.primary_field.field)
			this.setState({
				scatter_value_count
			})
		}
	}

	initialize_scatter_data = async () => {
		if (this.state.scatter_data === null){					
			const {count, ...rest} = await this.state.entry_object.children({limit: 0})	
			const entries = Object.values(rest).reduce((acc, c)=>([...acc, ...c]), [])
			this.generate_scatter_data(entries)
		}
	}

	
	table_row = (row, header) => {
		const cells = []
		for (const h of header){
			if (h.id === "name"){
				cells.push(
					<TableCell
						component="th"
						scope="row"
						key={`${h.id}-${row.name}`}
						style={h.style}
					>
						<a href={row.endpoint}>{row[h.id]}</a>
					</TableCell>
				)
			} else {
				cells.push(
					<TableCell
						align="right"
						key={`${h.id}-${row.name}`}
						style={h.style}
					>
						<span>{row[h.id]}</span>
					</TableCell>
				)
			}
		}
		return cells
	}

	handleChangePage = (event, newPage, direction) => {
		const {pagination} = this.state
		const limit = (pagination[direction] || {}).limit || 10
		const skip = limit * newPage
		this.setState(prevState=>({
			pagination: {
				...prevState.pagination,
				[direction]: {
					limit,
					skip
				}
			}
		}), ()=>{
			this.process_children(direction)
		})	
	};

	handleChangeRowsPerPage = (event, direction) => {
		const limit = parseInt(event.target.value, 10)
		this.setState(prevState=>({
			pagination: {
				...prevState.pagination,
				[direction]: {
					limit,
					skip: 0
				}
			}
		}), ()=>{
			this.process_children(direction)
		})
	}

	table_view = (direction) => {
		const {table_entries, head_cells} = this.state.children_data[direction]
		const {limit=10, skip=0} = this.state.pagination[direction] || {}
		return (
			<Grid container>
				<Grid item xs={12}>
					<div style={{width:"90%"}}>
						<TableContainer style={{minHeight: 350}}>
							<Table size="small" aria-label="enrichment table">
								<TableHead>
									{head_cells.map(c=>(
									<TableCell
										align={c.id === "name" ? "left":"right"}
										key={c.id}
										onClick={()=>{
											if (c.id.startsWith("score")){
												this.sortBy(c.id.replace('scores.',''))
											}
										}}
										style={c.id.startsWith("score") ? {
											cursor: "pointer"
										}: {}}
										style={c.style}
									>
										<b>{c.label}</b>
									</TableCell>
									))}
								</TableHead>
								<TableBody>
									{table_entries.map((row, i)=>(
										<TableRow key={row.name}>
											{this.table_row(row, head_cells)}
										</TableRow>
									))}
								</TableBody>
							</Table>
							<TablePagination
								component="div"
								align="right"
								count={this.state.children_count[direction]}
								rowsPerPage={limit}
								page={(skip/limit)}
								onChangePage={(event, newPage)=>this.handleChangePage(event, newPage, direction)}
								onChangeRowsPerPage={(event)=>this.handleChangeRowsPerPage(direction)}
							/>
						</TableContainer>
					</div>
				</Grid>
			</Grid>
		)
	}

	lazy_tooltip = async (payload) => {
		const {name, id, ["overlap size"]: overlap_size, actual_value, ["odds ratio"]: oddsratio} = payload
		const {resolved_entries} = await this.props.resolver.resolve_entries({model: "signatures", entries: [id]})
		const entry_object = resolved_entries[id]
		const children = (await entry_object.children({limit:0})).entities || []
		const overlap = children.map(e=>getName(e, this.props.schemas)).slice(0,10)
		const overlap_text = `${overlap.join(", ")}${children.length>10? "..." : null}`
		// if (setsize <= 15) overlap_text = overlap.join(", ")
		// else overlap_text = overlap.slice(0,15).join(", ") + "..."
		return(
			<Card style={{opacity:"0.8", textAlign: "left"}}>
				<CardContent>
					<Typography variant="h6">{name}</Typography>
					<Typography><b>{this.state.order_field}</b> {precise(actual_value)}</Typography>
					{ oddsratio ?
						<Typography><b>odds ratio:</b> {precise(oddsratio)}</Typography>
						: null
					}
					{ overlap_size ?
						<React.Fragment>
							<Typography><b>overlap size:</b> {overlap_size}</Typography>
							<Typography><b>overlaps:</b> {overlap_text}</Typography>
						</React.Fragment>: null
					}
				</CardContent>
			</Card>
		)
	}


	// componentDidUpdate = (prevProps) => {
	// 	if (prevProps.expanded_id !== this.props.id && this.props.expanded_id === this.props.id){
	// 		this.process_entry()
	// 	}
	// }

	componentDidMount = () => {
		this.process_entry()
	}

	toggleExpand = () => {
		if (this.props.expander) this.props.expander(this.state.entry.data.id)
	}

	onSearch = (search_terms) => {
		this.setState({
			search_terms,
			pagination: {}
		}, ()=>{
			this.process_children()
		})
	} 
	
	onScatterNodeClick = (data) => {
		const term = data.primary_value
		this.setState({term}, ()=>{
			this.process_results(term)
		})
	}

	get_top_value_count = async (input_term, primary_field) => {
		try {
			const resolver = this.props.resolver
			const library = this.state.entry.data
			const field = primary_field || this.state.primary_field.field
			resolver.abort_controller()
			resolver.controller()
			if (input_term === '') {
				const endpoint =  `/libraries/${library.id}/signatures/value_count`
				const filter = {
					limit: 5,
					fields: [field],
				}
				const scatter_value_count = (await resolver.aggregate( endpoint, filter))[field]
				return scatter_value_count
			} else {
				const endpoint =  `/signatures/value_count`
				const filter = {
					where: {
						library: library.id,
						[field]: {
							ilike: `%${input_term}%`
						}
					},
					limit: 10,
					fields: [field]
				}
				const scatter_value_count = (await resolver.aggregate( endpoint, filter))[field]
				return scatter_value_count
			}	
		} catch (error) {
			console.error(error)
		}
	
	}

	filter_metadata = async (term) => {
		try {
			const resolver = this.props.resolver
			const library = this.state.entry.data
			const primary_field = this.state.primary_field

			resolver.abort_controller()
			resolver.controller()
			if (term === '' || term === null) return {}
			else {
				const field = primary_field.search_field || primary_field.field
				const filter = {
					where: {
						library: library.id,
					}
				}
				if (term !== "") filter.where[field] = term
				// if (ids.length > 0) filter.where.id = {inq: ids}
				const {entries} = await resolver.filter_metadata({
					model: "signatures",
					filter,
					parent: library
				})
				return entries
			}
		} catch (error) {
			console.error(error)
		}
	}

	get_results = async (entries) => {
		try {
			const resolver = this.props.resolver
			const library = this.state.entry.data
			const datatype = library.dataset_type
			const database = library.dataset

			resolver.abort_controller()
			resolver.controller()

			const input = create_query(this.props.input)

			const query = {
				...input,
				datatype,
				database,
				input_type: input.entities !== undefined ? 'set': 'up_down',
				signatures: Object.keys(entries)
			}

			if (query.signatures.length === 0) query.limit = 100
			else query.limit = query.signatures.length
			const {set, up, down, rank} = await resolver.enrich_entities(query)
			
			if (set !== undefined) {
				const { entries: results, count } = set
	
				if (count>0){
					const {resolved_entries} = await resolver.resolve_entries({
						model: "signatures",
						entries: results.map(({id, direction, ...scores})=>({
							id,
							direction,
							scores
						}))
					})
					return resolved_entries
				}
			}if (rank !== undefined) {
				const { entries: results, count } = rank
	
				if (count>0){
					const {resolved_entries} = await resolver.resolve_entries({
						model: "signatures",
						entries: results.map(({id, direction, ...scores})=>({
							id,
							direction,
							scores
						}))
					})
					return resolved_entries
				}
			}else if (up !== undefined && down !== undefined) {
				const signatures = {}
				const { entries: up_entries, up_count } = up
	
				if (up_count>0){
					const {resolved_entries} = await resolver.resolve_entries({
						model: "signatures",
						entries: up_entries.map(({id, direction, ...scores})=>({
							id,
							direction,
							scores
						}))
					})
					for (const sig of Object.values(resolved_entries)){
						sig.update_entry({set: "up"})
						signatures[sig.id] = sig
					}
				}
				const { entries: down_entries, down_count } = down
	
				if (down_count>0){
					const {resolved_entries} = await resolver.resolve_entries({
						model: "signatures",
						entries: down_entries.map(({id, direction, ...scores})=>({
							id,
							direction,
							scores
						}))
					})
					for (const sig of Object.values(resolved_entries)){
						sig.update_entry({set: "down"})
						signatures[sig.id] = sig
					}
				}
				return signatures
			}
	
		} catch (error) {
			console.error(error)
		}
	}

	process_results = async (term) => {
		const entries = await this.filter_metadata(term)
		const signatures = await this.get_results(entries)
		await this.generate_scatter_data(Object.values(signatures))
	}

	scatter_fields = (child) => {
		const schemas = this.props.schemas
		const schema = findMatchedSchema(child, schemas)
		let primary_field
		let secondary_fields = []
		for (const [label, prop] of Object.entries(schema.properties)){
			if (prop.primary) {
				primary_field = {
					...prop,
					label
				}
			}
			if (prop.secondary) {
				secondary_fields.push({
					...prop,
					label
				})
			}
		}
		this.setState({
			primary_field,
			secondary_fields
		})
		return { primary_field, secondary_fields }
	}

	reset_scatter_plot = async () => {
		const scatter_selection = await this.get_top_value_count('')
		this.setState({
			scatter_selection,
			scatter_data: {},
			category: this.state.entry.data.dataset_type === "rank_matrix" ? "direction": "significance",
			term: '',
			input_term: '',
			scatter_selection: [],
		}, async ()=>{
			const {count, ...rest} = await this.state.entry_object.children({limit: 0})	
			const entries = Object.values(rest).reduce((acc, c)=>([...acc, ...c]), [])
			this.generate_scatter_data(entries)
		})
	}

	set_input_term = async (input_term) => {
		this.setState({input_term},()=>this.get_scatter_selection(input_term))
		
	}

	get_scatter_selection = async (input_term) => {
		if (this.state.term !==input_term){
			const results = await this.get_top_value_count(input_term)
			const scatter_selection = Object.keys(results || {})
			this.setState({scatter_selection})
		}
	}

	scatter_component = () => {
		// if (this.state.scatter_value_count === null) this.get_top_value_count()
		//this.initialize_scatter_value_count()
		this.initialize_scatter_data()
		const { primary_field, secondary_fields, entry } = this.state
		const cat = entry.data.dataset_type === 'rank_matrix' ? 'direction': 'significance'
		const name_props = entry.data.dataset_type === "geneset_library" ? {
			yAxisName: "-log(pval)",
			xAxisName: "odds ratio",
		}:
		{
			yAxisName: "zscore (up)",
			xAxisName: "zscore (down)",
		}
		return (
			<Grid item xs={12}>
				<ScatterComponent
					name_props={name_props}
					primary_field={primary_field}
					secondary_fields={secondary_fields}
					primary_color={this.props.theme.palette.primaryVisualization.light}
					secondary_color={this.props.theme.palette.secondaryVisualization.light}
					results={this.state.scatter_data}
					set_input_term={this.set_input_term}
					input_term={this.state.input_term}
					scatter_selection={this.state.scatter_selection}
					category={this.state.category || cat}
					set_category={category=>this.setState({category})}
					term={this.state.term}
					set_term={term=>this.setState({term}, ()=>this.process_results(term))}
					reset={this.reset_scatter_plot}
					scatterProps={{
						onClick: this.onScatterNodeClick
					}}
				/>
			</Grid>
		)
	}

	scatter_viz = () => {
		const expanded = this.props.expanded
		const nameProps = this.state.entry.data.dataset_type === "geneset_library" ? {
			yAxisName: "-log(pval)",
			xAxisName: "odds ratio",
		}:
		{
			yAxisName: "zscore (up)",
			xAxisName: "zscore (down)",
		}
		if (this.state.entry.data.dataset_type === "geneset_library") {
			if (this.state.scatter_data === undefined || this.state.scatter_data === null) return <CircularProgress />
			else {
				const scatter_props = this.props.scatter_props || {}
				return (
					<Grid item xs={12} sm={expanded ? 6: 12} align={expanded? "right":"center"}>
						<ScatterPlot
							data={this.state.scatter_data}
							{...nameProps}
							{...scatter_props}
							download={this.props.expanded}
						/>
					</Grid>
				)
			}
		}
		return null
	}

	bar_viz = () => {
		const expanded = this.props.expanded
		const bar_props = this.props.bar_props || {}
		const aligner =  Object.keys(this.state.children_data).length === 1 ? ["left"]:["right" , "left"]
		return Object.values(this.state.children_data).map((data, i)=>(
				<Grid item xs={12} sm={expanded ? 6: 12}
					align={expanded? aligner[i]:"center"}
					key={data.direction}
				>
					{ this.state.entry.data.dataset_type === "geneset_library" ? null:
						<Typography variant="body1"
									align={expanded ? aligner[i]:"center"}
									style={{
										textTransform: "capitalize",
										marginLeft: 10,
										marginRight: 10
									}}>
							{data.direction}
						</Typography>
					}
					<div style={{minHeight: 300}}>
						<EnrichmentBar data={data.bar_data} field={this.state.order_field} fontColor={"#FFF"} 
							barProps={{isAnimationActive:false}}
							{...bar_props}
							download={this.props.expanded}
						/>
					</div>
				</Grid>
			))
	}

	all_table = () => {
		const search_terms = this.state.search_terms
		return (
			<React.Fragment>
				<Grid item xs={1}>
					{ this.state.entry.data.dataset_type === "geneset_library" ?
						<div style={{marginTop:-10, marginLeft: 10}}>
							<Downloads data={[
								{
									text: `Download as TSV`,									
									onClick: () => {
										this.download_library('tsv', 'signatures')
									},
									icon: "mdi-download",
									caption: `Download as TSV`
								}
							]} 
							loading={this.state.downloading}/>
						</div>: null
					}
				</Grid>
				<Grid item xs={11} align="right">
					<ChipInput 
						input={search_terms}
						onSubmit={(term)=>{
							if (search_terms.indexOf(term)<0) this.onSearch([...search_terms, term])
						}}
						onDelete={ (term)=>{
								this.onSearch(search_terms.filter(t=>t!==term))
							}
						}
						ChipInputProps={{
							divProps: {
								style: {
									background: "#f7f7f7", 
									borderRadius: 25,
									width: 500,
									marginRight: 25
								}
							},
							inputProps: {
								placeholder: search_terms.length === 0 ? "Search for any term": "",
							}
						}}
					/>
				</Grid>
				{ Object.values(this.state.children_data).map(data=>(
					<Grid item xs={12} align="center" key={data.direction}>
						<Grid container>
							{ this.state.entry.data.dataset_type === "geneset_library" ? null:
								<React.Fragment>
									<Grid item xs={1}>
										<div style={{marginTop:-10}}>
											<Downloads data={[
												{
													text: `Download ${data.direction} as TSV`,
													onClick: () => {
														this.download_library('tsv', data.direction)
													},
													icon: "mdi-download"
												}
											]} 
											loading={this.state.downloading}/>
										</div>
									</Grid>
									<Grid item xs={11}>	
										<Typography variant="h6" align="center" style={{textTransform: "capitalize", marginRight: 40}}>
											{data.direction}
										</Typography>	
									</Grid>
								</React.Fragment>
							}
						</Grid>
						{this.table_view(data.direction)}
					</Grid>
				))}
			</React.Fragment>
		)
	}

	data_viz = () => {
		const expanded = this.props.expanded
		if (expanded) {
			if (this.state.entry.data.dataset_type === "geneset_library") {
				return (
					<Grid container>
						{this.scatter_viz()}
						{this.bar_viz()}
						{this.all_table()}
					</Grid>
				)
			} else {
				return(
					<Grid container>
						<Grid item xs={12} align="center">
							<ResultsTab
								tabs={[
									{
										label: "Bar Chart",
										value: "bar"
									},
									{
										label: "Scatter Plot",
										value: "scatter"
									}
								]}
								value={this.state.visualization}
								handleChange={(t)=>this.setState({visualization: t.value},()=>{
									if (t.value === 'bar') this.reset_scatter_plot()
								})}
								tabsProps={{centered: true}}
							/>
						</Grid>
						{this.state.visualization === "scatter" ?
							this.scatter_component():
							<React.Fragment>
								{this.bar_viz()}
								{this.all_table()}
							</React.Fragment>
						}
					</Grid>
				)
			}
		} else {
			if (this.state.entry.data.dataset_type === "geneset_library") {
				return (
					<Grid container>
						<Grid item xs={12} align="center">
							<ResultsTab
								tabs={[
									{
										label: "Bar Chart",
										value: "bar"
									},
									{
										label: "Scatter Plot",
										value: "scatter"
									}
								]}
								value={this.state.visualization}
								handleChange={(t)=>this.setState({visualization: t.value})}
								tabsProps={{centered: true}}
							/>
						</Grid>
						{this.state.visualization === "bar" ? this.bar_viz() : this.scatter_viz()}
					</Grid>
				)
			} else {
				return (
					<Grid container>
						{this.bar_viz()}				
					</Grid>
				)
			}
		}
		
	}

	generate_scatter_data = async (entries) => {
		// const {count, ...rest} = await this.state.entry_object.children({limit: 0})
		// let entries = Object.values(rest).reduce((acc, c)=>([...acc, ...c]), [])
		const child = entries[0]
		const scatter_data = await process_data({
			entries,
			library: this.state.entry.data,
			primary_color: this.props.theme.palette.primaryVisualization.light,
			secondary_color: this.props.theme.palette.secondaryVisualization.light,
			schemas: this.props.schemas,
			primary_field: this.state.primary_field,
			secondary_fields: this.state.secondary_fields,
			serialized: !(child instanceof Model)
		})
		this.setState({
			scatter_data
		})
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

	download_library = async (format, direction) => {
		await download_enrichment_for_library({
			entry: this.state.entry_object,
			filename: `${this.state.entry.info.name.text}${format==="json"?".json":".tsv"}`,
			schemas: this.props.schemas,
			start: this.start_download,
			end: this.finish_download,
			type: this.props.match.params.type,
			format,
			direction
		})
	}

	onClose = () => {
		this.setState({error: null},
		()=>{
			this.props.history.push({
				pathname: `${this.props.nav.SignatureSearch.endpoint}/${this.props.match.params.type}`,
			})
		}	
		)
	}

	render = () => {
		const expanded = this.props.expanded_id === null || this.props.expanded_id === this.props.id
		return (
			<React.Fragment>
				<Snackbar open={this.state.error!==null}
					anchorOrigin={{ vertical:"top", horizontal:"right" }}
					autoHideDuration={3000}
					onClose={()=>this.onClose()}
					message={this.state.error}
					ContentProps={{
						style: {
							backgroundColor: "#f44336",
						}
					  }}
					action={
						<Button size="small" aria-label="close" color="inherit" onClick={()=>this.onClose()}>
							<span className="mdi mdi-close-box mdi-24px"/>
						</Button>
					}
				/>
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					{ this.state.children_data === undefined ? 
						<CircularProgress/>:
						this.data_viz()
					}
				</Collapse>
			</React.Fragment>
		)
	}
}


LibraryEnrichment.propTypes = {
	id: PropTypes.string.isRequired,
	schemas: PropTypes.array.isRequired,
}

export default withRouter(withTheme(LibraryEnrichment))