import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import {EnrichmentBar} from './EnrichmentBar'
import {ScatterPlot} from './ScatterPlot'

import Color from 'color'
import Typography from '@material-ui/core/Typography';
import { precise } from '../ScorePopper'

import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import {
	get_signature_entities,
	create_query,
	enrichment,
	download_enrichment_for_library,
 } from '../Search/utils'
 import TableContainer from '@material-ui/core/TableContainer';
 import Table from '@material-ui/core/Table';
 import TableBody from '@material-ui/core/TableBody';
 import TableCell from '@material-ui/core/TableCell';
 import TableHead from '@material-ui/core/TableHead';
 import TableRow from '@material-ui/core/TableRow';
 import TablePagination from '@material-ui/core/TablePagination'
import { ChipInput } from '../SearchComponents'
import { withTheme } from '@material-ui/core/styles';
import Downloads from '../Downloads'
import {ResultsTab} from './ResultsTab'

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
			// table
			const e = labelGenerator(entry, this.props.schemas)
			const data = {
				name: e.info.name.text,
				endpoint: e.info.endpoint,
			}
			let generate_head_cells = false
			if (head_cells.length === 0) generate_head_cells = true
			if (generate_head_cells && e.info.name.priority > 0){
				head_cells.push({
					id: 'name',
					numeric: false,
					disablePadding: false,
					label: e.info.name.label
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
							label: tag.label
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
							label: tag.label
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
				name: getName(entry, this.props.schemas),
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
			let limit
			let skip
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
			this.setState({
				children_count,
				children,
				searching: false,
				paginate: false,
				direction,
				children_data,
			},()=>{
				if (this.state.entry.data.dataset_type === "geneset_library"){
					this.generate_scatter_data(final_query)
				}
			})	
		} catch (error) {
			console.error(error)
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
					>
						<a href={row.endpoint}>{row[h.id]}</a>
					</TableCell>
				)
			} else {
				cells.push(
					<TableCell
						align="right"
						key={`${h.id}-${row.name}`}
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
		console.log(this.state.children_data)
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
		const overlap = children.map(e=>getName(e, this.props.schemas)).slice(0,20)
		const overlap_text = `${overlap.join(", ")}${children.length>20? "..." : null}`
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
			if (this.state.scatter_data === undefined) return <CircularProgress />
			else {
				const scatter_props = this.props.scatter_props || {}
				return (
					<Grid item xs={12} sm={expanded ? 6: 12} align="center">
						<ScatterPlot
							data={this.state.scatter_data}
							{...nameProps}
							{...scatter_props}
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
		const aligner = ["right" , "left"]
		return Object.values(this.state.children_data).map((data, i)=>(
				<Grid item xs={12} sm={expanded ? 6: 12}
					align={expanded && Object.keys(this.state.children_data).length === 2? aligner[i]:"center"}
					key={data.direction}>
					{ this.state.entry.data.dataset_type === "geneset_library" ? null:
						<Typography variant="body1"
									align={expanded && Object.keys(this.state.children_data).length === 2? aligner[i]:"center"}
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
									icon: "mdi-download"
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
										<Typography variant="h6" align="center" style={{textTransform: "capitalize", marginLeft: 40}}>
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
			return( 
				<Grid container>
					{this.scatter_viz()}
					{this.bar_viz()}
					{this.all_table()}
				</Grid>
			)
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
								tab={this.state.visualization}
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

	generate_scatter_data = async (final_query=null) => {
		// if (this.state.scatter_data !== undefined) return
		const {count, ...children} = await this.state.entry_object.children({limit: 0})
		let colorize = null
		if (final_query.search.length > 0) {
			colorize = []
			const {count: cnt, ...colored} = await this.state.entry_object.children({...final_query, limit: 0})
			for (const entries of Object.values(colored)){
				for (const entry of entries){
					colorize.push(entry.id)
				}
			}
		}
		const inactiveColor="#c9c9c9"
		const scatterColor1 = this.props.theme.palette.primaryVisualization.light
		const scatterColor2  = this.props.theme.palette.secondaryVisualization.light
		const scatter_data = []
		for (const [direction, entries] of Object.entries(children)){
			for (const entry of entries){
				// scatter
				let color = inactiveColor
				if (colorize === null || colorize.indexOf(entry.id)>-1){
					if (direction === undefined || ["up", "reversers"].indexOf(direction) > -1 || direction === "signatures") {
						color = scatterColor1
					}else if (direction !== "ambiguous"){
						color = scatterColor2
					}
				}
				if (this.state.entry.data.dataset_type === "geneset_library"){ 
					scatter_data.push({
						name: getName(entry, this.props.schemas),
						yAxis: entry.scores["odds ratio"],
						xAxis: -Math.log(entry.scores["p-value"]),
						value: entry.scores["p-value"],
						color: entry.scores["p-value"] < 0.05 ? color: inactiveColor,
						id: entry.id,
						direction,
						...entry.scores,
						tooltip_component: this.lazy_tooltip
					})
				}else if (this.state.entry.data.dataset_type === "rank_matrix"){ 
					scatter_data.push({
						name: getName(entry, this.props.schemas),
						yAxis: entry.scores["z-score (up)"],
						xAxis: entry.scores["z-score (down)"],
						color,
						id: entry.id,
						direction,
						...entry.scores,
						tooltip_component: this.lazy_tooltip
					})
				}	
			}
		}
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

	render = () => {
		if (this.state.children_data === undefined) return <CircularProgress/>
		return this.data_viz()
	}
}


LibraryEnrichment.propTypes = {
	id: PropTypes.string.isRequired,
	schemas: PropTypes.array.isRequired,
}

export default withTheme(LibraryEnrichment)