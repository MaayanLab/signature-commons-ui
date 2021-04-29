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
			visualization: "bar",
			visualize: false,
			expanded: null,
			downloading: false,
			error: null,
		}
	}

	handleExpandClick = (expanded) => {
		if (expanded === this.state.expanded) expanded = null
		this.setState({
			expanded
		});
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

	RightComponent = (props) =>(
		<Tooltip title={props.text}>
			<IconButton aria-label="table" size="small" onClick={() => this.handleExpandClick(props.id)}>
				<span className={`mdi ${props.icon}`}
				/>
			</IconButton>
		</Tooltip>
	)

	BottomComponent = (props) => (
		<LibraryEnrichment {...this.props} {...props} id={props.id}/>
	)

	process_children_values = (entries, child_model) => {
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
			// e["RightComponents"] = [{
			// 	component: ,
			// 	props: {
			// 		icon: "mdi-24px mdi-arrow-collapse-all",
			// 		text: "Collapse"
			// 	}
			// }]
			// e.BottomComponents = [{
			// 	component: (props) => <LibraryEnrichment {...props}/>,
			// 	props: {
			// 		...this.props,
			// 		id: e.data.id
			// 	}
			// }]

			children.push(e)
		}
		return children
	}

	process_children = async () => {
		try {
			this.props.resolver.abort_controller()
			this.props.resolver.controller()
			const {entry_object} = this.state
			const library_priority = this.props.library_priority
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
			let children = this.process_children_values(Object.values(children_results), this.state.entry_object.child_model)
			if (Object.keys(library_priority).length > 0) {
				children = children.sort((a,b)=>((library_priority[a.data.id] || children.length) - (library_priority[b.data.id] || children.length)))
			}
			this.setState({
				children_count,
				children,
				page: skip/limit,
				perPage: limit,
				query,
				searching: false,
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

	handleError = (error) => {
		this.setState({
			error: error.message
		})
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
			}, ()=>{
				this.process_entry()
			})
		} else if (prev_search !== curr_search){
			this.setState({
				searching: true,
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

	ChildComponent = () => {
		if (this.state.children_count === undefined || this.state.entry_object === null) return <LinearProgress />
		const entry_name = (this.state.entry.info.name || {}).text || this.props.match.params.id
		const count = this.state.children_count[this.state.entry_object.child_model]
		const children_name = count === 1 ? this.props.preferred_name_singular[this.state.entry_object.child_model].toLowerCase():
											this.props.preferred_name[this.state.entry_object.child_model].toLowerCase()
		
		let label = this.props.results_title
		if (label === undefined || label === null){
			if (this.props.model === "signatures"){
				if ((this.state.entry.data.library || {}).dataset_type === "rank_matrix") return null
				label = `The input ${this.props.preferred_name_singular.signatures.toLowerCase()} has ${count} overlapping ${children_name} with ${entry_name}`
			}else if (this.props.model === "libraries") {
				if (count === 100) label = `Top ${count} enriched terms in ${entry_name}`
				else label = `There are ${count} enriched terms in ${entry_name}`
			}else if (this.props.model === "resources") {
				label = `Top enriched terms from ${count} ${children_name} in ${entry_name}`
			}
		}
		return(
			<Grid container>
				<Grid item xs={12} style={{margin: "10px 20px"}}>
					<EnrichmentResult
						searching={this.state.searching}
						search_terms={this.state.query.search || []}
						search_examples={[]}
						label={label}
						entries={this.state.children}
						DataTableProps={{
							onChipClick: v=>{
								if (v.field.includes('scores.')) this.sortBy(v.field.replace('scores.',''))
							},
							expanded: this.state.expanded,
							RightComponent: this.RightComponent,
							BottomComponent: this.BottomComponent,
						}}
						schema={this.state.entry.schema}
					/>
				</Grid>
			</Grid>
		)
	}

	handleSnackBarClose = (event, reason) => {
		this.setState({
			error: null,
		}, ()=>{
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