import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import {EnrichmentBar} from './EnrichmentBar'
import Color from 'color'
import Typography from '@material-ui/core/Typography';
import { precise } from '../ScorePopper'
import {ResultsTab} from './ResultsTab'

import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'
import { get_filter,
	get_signature_entities,
	create_query,
	enrichment,
 } from '../Search/utils'
 import Table from '@material-ui/core/Table';
 import TableBody from '@material-ui/core/TableBody';
 import TableCell from '@material-ui/core/TableCell';
 import TableHead from '@material-ui/core/TableHead';
 import TableRow from '@material-ui/core/TableRow';
 import TablePagination from '@material-ui/core/TablePagination'
import { ChipInput } from '../SearchComponents'

export default class LibraryEnrichment extends React.PureComponent {
	constructor(props){
		super(props)
		this.state={
			order_field: 'p-value',
			order: 'ASC',
			search_terms: [],
			direction: null,
			pagination: {}
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
			const order_field = entry.data.dataset_type === "geneset library" ? 'p-value': 'log p (fisher)'
			const order = entry.data.dataset_type === "geneset library" ? 'ASC': 'DESC'
			
			this.setState({
				entry_object,
				order_field,
				order,
			}, ()=> {
				this.process_children()
			})	
		} catch (error) {
			console.error(error)
		}
	}

	process_children_data = ({entries, barColor="#3a5278", inactiveColor="#9e9e9e"}) => {
		const color = Color(barColor)
		const bar_data = []
		const firstVal = entries[0].scores[this.state.order_field]
		const lastVal = entries[entries.length - 1].scores[this.state.order_field]
		const diff = firstVal - lastVal
		let col
		const table_entries = []
		const head_cells = [
			{ id: 'name', numeric: false, disablePadding: true, label: 'Term' },
		]
		for (const entry of entries){
			// table
			const e = labelGenerator(entry, this.props.schemas)
			const data = {
				name: e.info.name.text,
				endpoint: e.info.endpoint,
			}
			let generate_head_cells = false
			if (head_cells.length === 1) generate_head_cells = true
			for (const tag of e.info.tags){
				if (tag.field){
					if (!tag.field.startsWith("score")){
						data[tag.field] = tag.text
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
			}
			for (const [k,v] of Object.entries(e.data.scores)){
				data[k] = precise(v)
				if (generate_head_cells){
					head_cells.push({
						id: k,
						numeric: true,
						disablePadding: false,
						label: k
					})
				}
			}
			table_entries.push(data)

			// bar
			const value = entry.scores[this.state.order_field]
			if (col === undefined) {
				col = color
			}else {
				col = color.lighten((((firstVal - value)/(diff||1))))
			}
			const d = {
				name: getName(entry, this.props.schemas),
				value,
				color: value > -Math.log(0.05) ? col.hex(): inactiveColor,
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
			const direction_tabs = []
			for (const dir of ["signatures", "up", "down", "mimickers", "reversers"]) {
				if (children_count[dir]){
					if (direction === null) direction = dir
					direction_tabs.push({
						label: dir,
						count: children_count[dir],
						value: dir
					})
				}
			}
			const {bar_data, table_entries, head_cells} = this.process_children_data({
				entries: children[direction] || []
			})
			this.setState({
				children_count,
				children,
				direction_tabs,
				page: skip/limit,
				perPage: limit,
				searching: false,
				paginate: false,
				direction,
				bar_data,
				table_entries,
				head_cells
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

	handleChangePage = (event, newPage) => {
		const {pagination, direction} = this.state
		const limit = (pagination[direction] || {}).limit || 10
		const skip = limit * newPage
		this.setState(prevState=>({
			pagination: {
				...prevState.pagination,
				[prevState.direction]: {
					limit,
					skip
				}
			}
		}), ()=>{
			this.process_children(this.state.direction)
		})	
	};

	handleChangeRowsPerPage = (event) => {
		const limit = parseInt(event.target.value, 10)
		this.setState(prevState=>({
			pagination: {
				...prevState.pagination,
				[prevState.direction]: {
					limit,
					skip: 0
				}
			}
		}), ()=>{
			this.process_children(this.state.direction)
		})
	}

	table_view = () => {
		const {table_entries, head_cells} = this.state
		const {limit=10, skip=0} = this.state.pagination[this.state.direction] || {}
		return (
			<Grid container>
				<Grid item xs={12}>
					<div style={{width:"90%", overflow: "auto"}}>
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
							count={this.state.children_count[this.state.direction]}
							rowsPerPage={limit}
							page={(skip/limit)}
							onChangePage={this.handleChangePage}
							onChangeRowsPerPage={this.handleChangeRowsPerPage}
						/>
					</div>
				</Grid>
			</Grid>
		)
	}

	lazy_tooltip = async (payload) => {
		const {name, id, setsize, value, color, ...scores} = payload
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
					{Object.entries(scores).map(([k,v])=>(
						<Typography><b>{k}</b> {precise(v)}</Typography>
					))}
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


	componentDidMount = () => {
		this.process_entry()
	}

	handleChangeTab = (e,direction) => {
		if (direction){
			const {bar_data, table_entries, head_cells} = this.process_children_data({
				entries: this.state.children[direction] || []
			})
			this.setState({
				direction,
				bar_data,
				table_entries,
				head_cells
			})
		}
	}

	onSearch = (search_terms) => {
		this.setState({
			search_terms,
			pagination: {}
		}, ()=>{
			this.process_children()
		})
	} 

	render = () => {
		const search_terms = this.state.search_terms
		if (this.state.bar_data === undefined) return <CircularProgress/>
		return(
			<Grid container>
				<Grid item xs={12} align="right">
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
				<Grid item xs={12} align="center">
					<ResultsTab
						tabs={this.state.direction_tabs}
						value={this.state.direction}
						handleChange={this.handleChangeTab}
						tabsProps={{
							centered: true,
						}}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					<EnrichmentBar data={this.state.bar_data} field={this.state.order_field} fontColor={"#FFF"} 
						barProps={{isAnimationActive:false}}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					{this.table_view()}
				</Grid>
			</Grid>
		)
	}
}


LibraryEnrichment.propTypes = {
	id: PropTypes.string.isRequired,
	schemas: PropTypes.array.isRequired,
}