import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Filter } from '../SearchComponents'
import { TextFieldSuggest } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {ResultsTab} from '../MetadataPage/ResultsTab'
import {DataTable} from '../DataTable'
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'
import LinearProgress from '@material-ui/core/LinearProgress'

import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';
import {ScatterPlot} from '../MetadataPage/ScatterPlot'
import {EnrichmentBar} from '../MetadataPage/EnrichmentBar'
import Link from '@material-ui/core/Link'

import Lazy from '../Lazy'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';


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
		resolving,
		submitName="Search"
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
				<div style={{
					margin: "auto",
					position: 'relative',}}>
					<Button variant="contained" color="primary" size="small" disabled={searching || resolving || TextFieldSuggestProps.disabled} style={{marginTop:10, textTransform: 'capitalize'}} onClick={()=>TextFieldSuggestProps.onSubmit()}>
						<span className="mdi mdi-magnify mdi-24px" /><Typography align={"center"}>{submitName}</Typography>
					</Button>
					{(searching || resolving) && <CircularProgress size={24} style={{
													position: 'absolute',
													top: '50%',
													left: '50%',
													marginTop: -12,
													marginLeft: -12,
												}}/>}
				</div>
				<Typography align={"center"}  style={{marginTop:10}}>
					<Examples {...TextFieldSuggestProps} />
				</Typography>
			</Grid>
		</Grid>
	)
}

const LibraryCardContent = async (props) => {
	const {entry, process_children, onClick, visualization, order_field} = props
	const {bar_data, scatter_data} = await process_children(entry.data.id)
	const viz = visualization[entry.data.id] || "bar"
	return (
		<React.Fragment>
			{ viz === "bar" ? 
				<EnrichmentBar data={bar_data} field={order_field} fontColor={"#FFF"} 
					barProps={{isAnimationActive:false}}
					barChartProps={{
						onClick: v=>onClick(v.activePayload[0].payload),
						height: 300,
						width: 300
					}}/>:
					<ScatterPlot
						data={scatter_data}
						scatterChartProps={{
							height:300,
							width:300,
							style:{
								display: "block",
								margin: "auto"
							}
						}}
						scatterProps={{ onClick }}/>
			}
		</React.Fragment>
	)
}

const Results = (props) => {
	const {
		entries,
		searching,
		ResourceTabProps,
		setVisualization,
		...rest
	} = props
	if (entries === null) return null
	else if (searching) {
		return (
			<Grid container spacing={3}>
				<Grid item xs={12}>
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
				</Grid>
				<Grid item xs={12} align="center">
					<LinearProgress/>
				</Grid>
			</Grid>
		)
	}else {
		return (
			<Grid container spacing={3}>
				<Grid item xs={12}>
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
					
				</Grid>
				{entries.map(entry=>(
					<Grid item xs={12} sm={6} md={4} key={entry.data.id}>
						<Card style={{margin: 10, height: 500}}>
							<CardHeader
								title={<Link href={entry.info.endpoint}>{entry.info.name.text}</Link>}
								subheader={`${entry.data.scores.signature_count} Enriched Terms`}
								action={
									<ToggleButtonGroup
										value={rest.visualization[entry.data.id] || "bar"}
										exclusive
										onChange={(e, v)=>{
											setVisualization(entry.data.id, v)
										}}
										aria-label="text alignment"
									>
										<ToggleButton value="bar" aria-label="bar">
											<span className="mdi mdi-chart-bar mdi-rotate-90"/>
										</ToggleButton>
										<ToggleButton value="scatter" aria-label="scatter">
											<span className="mdi mdi-chart-scatter-plot"/>
										</ToggleButton>
									</ToggleButtonGroup>
								  }
							/>
							<CardContent>
								<Lazy reloader={rest.visualization[entry.data.id]}>{async () => LibraryCardContent({entry, ...rest})}</Lazy>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		)
	}
}

export const ResourceCustomTabs = withStyles(() => ({
	flexContainer: {
	  flexWrap: 'wrap',
	},
	indicator: {
		opacity: 0
	}
  }))((props) => <Tabs {...props} />);


  export const ResourceCustomTab = withStyles(() => ({
	selected: {
		borderBottom: "2px solid"
	},
  }))((props) => <Tab {...props} />);

export const SignatureSearchComponent = (props) => {
	const {
		searching=false,
		chipRenderer,
		entries,
		DataTableProps,
		PaginationProps,
		SearchTabProps,
		ResourceTabProps,
		LibrariesTabProps,
		TextFieldSuggestProps,
		resolving,
		MiddleComponents=[],
		scatter_plot=null,
		filters,
		submitName,
		ResultsProps
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
				{ ResourceTabProps===undefined ?
					<SigForm {...props}/>:						
					<Collapse in={expanded} timeout="auto" unmountOnExit>
						<SigForm {...props}/>
					</Collapse>
				}
			</Grid>
			{ ResourceTabProps!==undefined ?
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
				<Results {...ResultsProps} searching={searching} ResourceTabProps={{
					...ResourceTabProps,
					TabComponent: ResourceCustomTab,
					TabsComponent: ResourceCustomTabs,
					}}/>
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
	submitName: PropTypes.string,
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
	ResultsProps: PropTypes.shape({
		entries: PropTypes.array,
		process_children: PropTypes.func,
		onClick: PropTypes.func,
		visualization: PropTypes.objectOf(PropTypes.oneOf['bar', 'scatter', 'table']),
		setVisualization: PropTypes.func,
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