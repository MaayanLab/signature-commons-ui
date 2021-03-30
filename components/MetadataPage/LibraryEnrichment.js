import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import {InfoCard} from '../DataTable'
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
	download_signature,
	get_data_for_bar_chart,
	download_enrichment_for_library,
 } from '../Search/utils'

export default class LibraryEnrichment extends React.PureComponent {
	constructor(props){
		super(props)
		this.state={
			order_field: 'p-value',
			order: 'ASC'
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

	process_bar_data = ({entries, barColor="#3a5278", inactiveColor="#9e9e9e"}) => {
		const color = Color(barColor)
		const bar_data = []
		const firstVal = entries[0].scores[this.state.order_field]
		const lastVal = entries[entries.length - 1].scores[this.state.order_field]
		const diff = firstVal - lastVal
		let col
		for (const entry of entries){
			const value = entry.scores[this.state.order_field]
			if (col === undefined) {
				col = color
			}else {
				console.log(firstVal, lastVal, diff, value)
				console.log((firstVal - value)/diff)
				col = color.lighten((((firstVal - value)/diff)))
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
		
		return bar_data
	}


	process_children = async () => {
		try {
			// this.props.resolver.abort_controller()
			this.props.resolver.controller()

			const {search: filter_string} = this.props.location
			const query = get_filter(filter_string)
			const {limit=10,
				skip= 0,
				order= [this.state.order_field, this.state.order],
				} = query
			const final_query = {
				limit, skip, order,
				search: query.search
			}
			const {count:children_count, ...children} = await this.state.entry_object.children(final_query)
			const direction = Object.keys(children_count).filter(k=>children_count[k])[0]
			const bar_data = this.process_bar_data({
				entries: children[direction] || []
			})
			this.setState({
				children_count,
				children,
				page: skip/limit,
				perPage: limit,
				query,
				searching: false,
				paginate: false,
				direction,
				bar_data
			})	
		} catch (error) {
			console.error(error)
		}
			
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
			const bar_data = this.process_bar_data({
				entries: this.state.children[direction] || []
			})
			this.setState({
				direction,
				bar_data
			})
		}
	}

	render = () => {
		if (this.state.bar_data === undefined) return <CircularProgress/>
		const tabs = []
		for (const [k,v] of Object.entries(this.state.children_count)){
			if (v>0){
				tabs.push({
					label: k,
					count: v,
					value: k
				})
			}
		}
		return(
			<Grid container>
				<Grid xs={12} align="center">
					<ResultsTab
						tabs={tabs}
						value={this.state.direction}
						handleChange={this.handleChangeTab}
						tabsProps={{
							centered: true,
						}}
					/>
				</Grid>
				<Grid xs={12} align="center">
					<EnrichmentBar data={this.state.bar_data} field={this.state.order_field} fontColor={"#FFF"} 
						barProps={{isAnimationActive:false}}
					/>
				</Grid>
			</Grid>
		)
	}
}


LibraryEnrichment.propTypes = {
	id: PropTypes.string.isRequired,
	enrichment_id: PropTypes.string.isRequired,
	schemas: PropTypes.array.isRequired,
}