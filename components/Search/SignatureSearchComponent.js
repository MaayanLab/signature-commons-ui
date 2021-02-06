import React from 'react'
import PropTypes from 'prop-types'
import { Filter } from '../SearchComponents'
import { TextFieldSuggest } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {ResultsTab} from '../MetadataPage/ResultsTab'
import {DataTable} from '../DataTable'
import { Typography, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';
import {ScatterPlot} from '../MetadataPage/ScatterPlot'
import Lazy from '../Lazy'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const create_data = (table_input) => {
	const column_names = {}
	const data = []
	for (const i of table_input){
		const d = {
			name: i.info.name.text,
			href: i.info.endpoint
		}
		column_names["Name"] = "name"
		for (const f of i.info.tags){
			d[f.field] = f.text
			column_names[f.label] = f.field
		}
		data.push(d)
	}
	return {column_names, data}
}

const TableCells = ({row, column_names}) => {
	const cells = []
	for (const v of Object.values(column_names)){
		if (v==="name"){
			cells.push(
				<TableCell component="th" scope="row">
					<a href={row.href}>{row[v]}</a>
				</TableCell>
			)
		} else {
			cells.push(
				<TableCell align="right">
					{row[v]}
				</TableCell>
			)
		}
	}
	return cells
}

export const Collapsible = (props) => {
	const {open, active, signature_name, onButtonClick, onNodeClick, data: lib_data, href} = props
	if (lib_data === undefined){
		return <Collapse in={open}><div style={{height: 800, paddingTop: 200, textAlign: "center"}}><CircularProgress/></div></Collapse>
	}else {
		const {scatter_data, entries: table_data} = lib_data
		const {column_names, data} = create_data(table_data)
		return(
			<Collapse in={open}>
				<Grid container style={{height: 800, overflow: "auto"}}>
					<Grid xs={12} align="right">
						<Tooltip title={'Scatter Plot'}>
							<Button
								color="primary"
								disabled={active==="scatter"}
								onClick={()=>onButtonClick("scatter")}
							>
								<span className="mdi mdi-chart-scatter-plot mdi-24px"/>
							</Button>
						</Tooltip>
						<Tooltip title={`View Enriched ${signature_name}`}>
							<Button
								color="primary"
								disabled={active==="table"}
								onClick={()=>onButtonClick("table")}
							>
								<span className="mdi mdi-table mdi-24px"/>
							</Button>
						</Tooltip>
					</Grid>
					{ active==="scatter" ?
						<Grid xs={12} style={{padding: 20}}>
							<Typography style={{marginBottom: 10, fontWeight: 'bold'}} variant="body2">
								Click on a node to view the overlaps. Click <a href={href} style={{textDecoration: "underline"}}>here</a> to view more {`${signature_name}`}.
							</Typography>
							<div style={{
										justifyContent: "center",
										alignItems: "center"
									}}>
								<ScatterPlot
									data={scatter_data}
									scatterChartProps={{
										height:600,
										width:600,
										style:{
											display: "block",
											margin: "auto"
										}
									}}
									scatterProps={{onClick: onNodeClick }}/>
							</div>
						</Grid>
						:
						<Grid xs={12} style={{padding: 20}}>
							<Typography style={{marginBottom: 10}} style={{marginBottom: 10, fontWeight: 'bold'}} variant="body2">
								Click on a name to view the overlaps. Click <a href={href} style={{textDecoration: "underline"}}>here</a> to view more {`${signature_name}`}.
							</Typography>
							<TableContainer component={Paper}>
								<Table aria-label="signature table">
									<TableHead>
										<TableRow>
											{Object.keys(column_names).map(name=><TableCell align={name==='Name' ? "left": "right"}>{name}</TableCell>)}
										</TableRow>
									</TableHead>
									<TableBody>
									{data.map((row) => (
										<TableRow key={row.name}>
											<TableCells row={row} column_names={column_names}/>	
										</TableRow>
									))}
									</TableBody>
								</Table>
							</TableContainer>
						</Grid>
					}						
				</Grid>
			</Collapse>
		)	
	}
}
const Examples = (props) => {
	const {examples, type, onAdd} = props
	const example_buttons = []
	for (const ex of examples){
		if (ex.type === type){
			example_buttons.push(
				<Button variant="text" color="primary" style={{textTransform: "none"}} key={ex.label} onClick={()=>{
					if (type === "Overlap") {
						onAdd(ex.entities, "entities")
					} else {
						onAdd(ex.up_entities, "up_entities")
						onAdd(ex.down_entities, "down_entities")
					}
				}}>
					{ex.label}
				</Button>
			)
		}
	}
	return example_buttons
}

const SigForm = (props={}) => {
	const {
		searching=false,
		SearchTabProps,
		TextFieldSuggestProps,
		resolving
	} = props

	return(
		<Grid container spacing={1}>
			{/* Search Components */}
			<Grid item xs={12}>
				{TextFieldSuggestProps.input.entities !== undefined ?
					<TextFieldSuggest {...TextFieldSuggestProps}
							input={Object.values(TextFieldSuggestProps.input.entities)}
							onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "entities")}
							onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "entities")}
					/>:
					<React.Fragment>
						<TextFieldSuggest {...TextFieldSuggestProps}
							input={Object.values(TextFieldSuggestProps.input.up_entities)}
							onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
							onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
							onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "up_entities")}
							onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "up_entities")}
						/>
						<TextFieldSuggest {...TextFieldSuggestProps}
							input={Object.values(TextFieldSuggestProps.input.down_entities)}
							onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
							onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
							onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "down_entities")}
							onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "down_entities")}
						/>
					</React.Fragment>
				}
			</Grid>
			<Grid item xs={12} align="center">
				{searching || resolving ? 
					<Button variant="contained" color="primary" size="small" disabled style={{marginTop:10}}>
						<span className="mdi mdi-loading mdi-spin mdi-24px" /><Typography align={"center"}>Searching...</Typography>
					</Button>
				:
					<Button variant="contained" color="primary" size="small" disabled={TextFieldSuggestProps.disabled} style={{marginTop:10}} onClick={()=>TextFieldSuggestProps.onSubmit()}>
						<span className="mdi mdi-magnify mdi-24px" /><Typography align={"center"}>Search</Typography>
					</Button>
				}
				<Typography align={"center"}  style={{marginTop:10}}>
					<Examples {...TextFieldSuggestProps} />
				</Typography>
			</Grid>
		</Grid>
	)
}

const middle_components = (props) => {
	const {
		searching,
		MiddleComponents=[]
	} = props
	if (searching) return <CircularProgress/>
	else {
		return MiddleComponents.map(c=>c.component(c.props))
	}
}

export const Scatter = async (props) => {
	const {
		scatterChartProps,
		scatterProps,
		data
	} = props
	if (data===undefined || data===null) return null
	return (
		<React.Fragment>
			<ScatterPlot data={Object.keys(data)}
				{...scatterProps}
				{...scatterChartProps}
			/>		
		</React.Fragment>
	)
}

const Results = (props) => {
	const {
		entries,
		searching,
		PaginationProps,
		DataTableProps,
		ResourceTabProps
	} = props

	if (entries === null) return null
	else if (searching) return <div style={{textAlign:"center"}}><CircularProgress/></div>
	else {
		return (
			<React.Fragment>
				<ResultsTab
					tabProps={{
						style:{
							minWidth: 180,
							paddingRight: 25,
							paddingLeft: 25
						}
					}}
					divider
					{...ResourceTabProps}
				/>
				<DataTable entries={entries} {...DataTableProps}/>
				{/* <TablePagination
					{...PaginationProps}
					component="div"
					align="right"
				/> */}
			</React.Fragment>
		)
	}
}

export const SignatureSearchComponent = (props) => {
	const {
		searching=false,
		chipRenderer,
		entries,
		DataTableProps,
		PaginationProps,
		SearchTabProps,
		ResourcesTabProps,
		LibrariesTabProps,
		TextFieldSuggestProps,
		resolving,
		MiddleComponents=[],
		scatter_plot=null,
		filters,
	} = props

	const [expanded, setExpanded] = React.useState(false);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))

	return(
		<Grid container spacing={1}  style={{marginBottom: 20}}>
			<Grid item xs={12} md={2}/>
			<Grid item xs={12} md={6} lg={7}>
				{ SearchTabProps.tabs.length < 2 ? null:
					<ResultsTab
						tabsProps={{
							centered: true,
							variant: "fullWidth",
						}}
						tabProps={{
							style:{
								minWidth: 180
							}
						}}
						divider
						{...SearchTabProps}
					/>
				}
				{ entries===null ?
					<SigForm {...props}/>:						
					<Collapse in={expanded} timeout="auto" unmountOnExit>
						<SigForm {...props}/>
					</Collapse>
				}
			</Grid>
			{ entries!==null ?
				<Grid item xs={12} md={4} lg={3}>
					<Tooltip title="Click to view input" placement="bottom">
						
						<Button onClick={handleExpandClick}
							aria-expanded={expanded}
							aria-label="show more"
						>
							<span className="mdi mdi-note-text-outline mdi-24px"/>
						</Button>
					</Tooltip>
				</Grid>: null
			}
			{/* <Grid item xs={12} md={2}/> */}
			<Grid item xs={12}>
				<Results {...props}/>
			</Grid>
			{/* <Grid item xs={12} md={4} lg={3} align="center">
				{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>console.log(e.target.value)}/>)}
			</Grid> */}
			{/* <Grid item xs={12} md={6} lg={7} align="center">
				{ scatter_plot!==null?
					<Lazy>{async () => Scatter(scatter_plot)}</Lazy>:
					null
				}
				{middle_components(props)}
			</Grid> */}
		</Grid>
	)
}

SignatureSearchComponent.propTypes = {
	searching: PropTypes.bool,
	search_terms: PropTypes.arrayOf(PropTypes.string),
	search_examples: PropTypes.arrayOf(PropTypes.string),
	chipRenderer: PropTypes.func,
	onSearch: PropTypes.func,
	onFilter: PropTypes.func,
	filters: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		field: PropTypes.string,
		priority: PropTypes.number,
		values: PropTypes.objectOf(PropTypes.number),
		value: PropTypes.string,
	})),
	entries: PropTypes.arrayOf(PropTypes.object).isRequired,
	scatter_plot: PropTypes.shape({
		data: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			id: PropTypes.string,
			oddsratio: PropTypes.number,
			logpval: PropTypes.number,
			pval: PropTypes.number,
			color: PropTypes.string,
		})),
		scatterChartProps: PropTypes.object,
		scatterProps: PropTypes.object,
	}),
	DataTableProps: PropTypes.shape({
		onChipClick: PropTypes.func,
		InfoCardComponent: PropTypes.node,
		TopComponents: PropTypes.shape({
			component: PropTypes.func,
			props: PropTypes.object
		}),
		BottomComponents: PropTypes.shape({
			component: PropTypes.func,
			props: PropTypes.object
		})
	}),
	PaginationProps: PropTypes.shape({
		page: PropTypes.number,
		rowsPerPage: PropTypes.number,
		count: PropTypes.number,
		onChangePage: PropTypes.func,
		onChangeRowsPerPage: PropTypes.func,
	}).isRequired,
	SearchTabProps: PropTypes.shape({
		tabs: PropTypes.arrayOf(PropTypes.shape({
			label: PropTypes.string.isRequired,
			href: PropTypes.string,
			count: PropTypes.number,
			value: PropTypes.string,
		})),
		TabComponent: PropTypes.node,
		TabsComponent: PropTypes.node,
		value: PropTypes.string.isRequired,
		handleChange: PropTypes.func,
		tabsProps: PropTypes.object,
	}).isRequired,
	ResourcesTabProps: PropTypes.shape({
		tabs: PropTypes.arrayOf(PropTypes.shape({
			label: PropTypes.string.isRequired,
			href: PropTypes.string,
			count: PropTypes.number,
			value: PropTypes.string,
		})),
		TabComponent: PropTypes.node,
		TabsComponent: PropTypes.node,
		value: PropTypes.string.isRequired,
		handleChange: PropTypes.func,
		tabsProps: PropTypes.object,
	}).isRequired,
	LibrariesTabProps: PropTypes.shape({
		tabs: PropTypes.arrayOf(PropTypes.shape({
			label: PropTypes.string.isRequired,
			href: PropTypes.string,
			count: PropTypes.number,
			value: PropTypes.string,
		})),
		TabComponent: PropTypes.node,
		TabsComponent: PropTypes.node,
		value: PropTypes.string.isRequired,
		handleChange: PropTypes.func,
		tabsProps: PropTypes.object,
	}).isRequired,
	TextFieldSuggestProps: PropTypes.shape({
		input: PropTypes.shape(PropTypes.oneOf([
			{
				entities: PropTypes.arrayOf(PropTypes.shape({
					label: PropTypes.string.isRequired,
					type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
					id: PropTypes.arrayOf(PropTypes.oneOfType([
						PropTypes.string,
						PropTypes.number
					  ])),
					suggestions: PropTypes.arrayOf(PropTypes.shape({
						label: PropTypes.string.isRequired,
						type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
						id: PropTypes.oneOfType([
							PropTypes.string,
							PropTypes.number
						  ]),     
					})),
					gridColumnProps: PropTypes.object,
					gridRowProps: PropTypes.object,
					avatarProps: PropTypes.object,
					labelProps: PropTypes.object,
					chipProps: PropTypes.object,
					suggestionsProps: PropTypes.object,
				}))
			},
			{
				up_entities: PropTypes.arrayOf(PropTypes.shape({
					label: PropTypes.string.isRequired,
					type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
					id: PropTypes.arrayOf(PropTypes.oneOfType([
						PropTypes.string,
						PropTypes.number
					  ])),
					suggestions: PropTypes.arrayOf(PropTypes.shape({
						label: PropTypes.string.isRequired,
						type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
						id: PropTypes.oneOfType([
							PropTypes.string,
							PropTypes.number
						  ]),     
					})),
					gridColumnProps: PropTypes.object,
					gridRowProps: PropTypes.object,
					avatarProps: PropTypes.object,
					labelProps: PropTypes.object,
					chipProps: PropTypes.object,
					suggestionsProps: PropTypes.object,
				})),
				down_entities: PropTypes.arrayOf(PropTypes.shape({
					label: PropTypes.string.isRequired,
					type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
					id: PropTypes.arrayOf(PropTypes.oneOfType([
						PropTypes.string,
						PropTypes.number
					  ])),
					suggestions: PropTypes.arrayOf(PropTypes.shape({
						label: PropTypes.string.isRequired,
						type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
						id: PropTypes.oneOfType([
							PropTypes.string,
							PropTypes.number
						  ]),     
					})),
					gridColumnProps: PropTypes.object,
					gridRowProps: PropTypes.object,
					avatarProps: PropTypes.object,
					labelProps: PropTypes.object,
					chipProps: PropTypes.object,
					suggestionsProps: PropTypes.object,
				}))
			}
		])).isRequired,
		onSubmit: PropTypes.func.isRequired,
		onAdd: PropTypes.func.isRequired,
		onDelete: PropTypes.func.isRequired,
		onClick: PropTypes.func.isRequired,
		onSuggestionClick: PropTypes.func.isRequired,
		renderChip: PropTypes.func,
		colors_and_icon: PropTypes.shape({
			background: PropTypes.string,
			color: PropTypes.string,
			icon: PropTypes.string
		}),
		placeholder: PropTypes.string,
		gridColumnProps: PropTypes.object,
		gridRowProps: PropTypes.object,
		avatarProps: PropTypes.object,
		labelProps: PropTypes.object,
		chipProps: PropTypes.object,
		chipInputProps: PropTypes.object,
		formProps: PropTypes.object,
		suggestionsProps: PropTypes.object
	})
}