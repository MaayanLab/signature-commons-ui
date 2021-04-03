import React from 'react'
import PropTypes from 'prop-types'
import { TextFieldSuggest } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import {ResultsTab} from '../MetadataPage/ResultsTab'
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'

import Tooltip from '@material-ui/core/Tooltip';

import Switch from '@material-ui/core/Switch';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';
import {IconComponentButton} from '../DataTable'
import EnrichmentPage from '../MetadataPage/EnrichmentPage'
import Collapse from '@material-ui/core/Collapse';

const Examples = (props) => {
	const {examples=[], type, onAdd, resetInput} = props
	const example_buttons = []
	for (const ex of examples){
		example_buttons.push(
			<Button variant="text" color="primary" style={{textTransform: "none"}} key={ex.label} onClick={()=>{
				resetInput()
				if (type === "Overlap") {
					onAdd(ex.input.entities, "entities")
				} else {
					onAdd(ex.input.up_entities, "up_entities")
					onAdd(ex.input.down_entities, "down_entities")
				}
			}}>
				{ex.label}
			</Button>
		)
		if (ex.link!==undefined){
			example_buttons.push(
				<Button 
					style={{minWidth: 5}}
					href={ex.link}
					target = "_blank" 
					rel = "noopener noreferrer" 
				>
					<span className="mdi mdi-open-in-new"/>
				</Button>
			)
		}
	}
	return example_buttons
}

const EntityCounts = (input) => {
	const { valid=0, invalid=0, suggestions=0 } = input
	if (valid || invalid){
		return(
			<div style={{position: "absolute", top: 20, right: 20}}>
				<Typography color="primary">{`${valid} valid ${valid > 1 ? "entries": "entry"}`}</Typography>
				<Typography color="error">{`${invalid} invalid ${invalid > 1 ? "entries": "entry"}`}</Typography>
				<Typography>{`${suggestions} ${suggestions > 1 ? "need": "needs"} review`}</Typography>
			</div>
		)
	}else return null
}

const SigForm = (props={}) => {
	const {
		searching=false,
		TextFieldSuggestProps,
		resolving,
		submitName="Search",
		enrichment_tabs,
		type,
		collapsed
	} = props

	// let left_spacer = ""
	// let right_spacer = ""
	// if (Object.keys(enrichment_tabs).length === 2){
	// 	const overlap_label = enrichment_tabs.Overlap.label
	// 	const rank_label = enrichment_tabs.Rank.label
	// 	if (overlap_label.length > rank_label.length) right_spacer = String.fromCharCode(160).repeat(overlap_label.length-rank_label.length + 5)
	// 	if (overlap_label.length < rank_label.length) left_spacer = String.fromCharCode(160).repeat(rank_label.length-overlap_label.length + 5)
	// }
	
	return(
		<Grid container>
			{/* Search Components */}
			{ Object.keys(enrichment_tabs).length === 1 ? null:
				<Grid item xs={12} align="center" style={{marginTop: 5}}>
					<Typography>
						{enrichment_tabs.Overlap.label}
						<Switch checked={type === "Rank"}
								onChange={TextFieldSuggestProps.toggleSwitch}
								name="active"
								color="default"/>
						{enrichment_tabs.Rank.label}
					</Typography>
				</Grid>
			}
			<Grid item xs={12}>
				{type === 'Overlap' ?
					<React.Fragment>
						<TextFieldSuggest {...TextFieldSuggestProps}
							input={Object.values(TextFieldSuggestProps.input.entities)}
							onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "entities")}
							onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "entities")}
							endAdornment={<EntityCounts {...TextFieldSuggestProps.input.set_stats}/>}
							placeholder={enrichment_tabs.Overlap.placeholder}
						/>
					</React.Fragment>
					:
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<TextFieldSuggest {...TextFieldSuggestProps}
								input={Object.values(TextFieldSuggestProps.input.up_entities)}
								onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
								onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
								onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "up_entities")}
								onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "up_entities")}
								placeholder={enrichment_tabs.Rank.up_placeholder}
								endAdornment={<EntityCounts {...TextFieldSuggestProps.input.up_stats}/>}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextFieldSuggest {...TextFieldSuggestProps}
								input={Object.values(TextFieldSuggestProps.input.down_entities)}
								onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
								onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
								onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "down_entities")}
								onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "down_entities")}
								placeholder={enrichment_tabs.Rank.down_placeholder}
								endAdornment={<EntityCounts {...TextFieldSuggestProps.input.down_stats}/>}
							/>
						</Grid>
					</Grid>
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


const Results = (props) => {
	const {
		entries,
		searching,
		type,
		EnrichmentPageProps,
	} = props
	if (entries === null && !searching) return null
	else if (searching) {
		return (
			<Grid container spacing={3}>
				<Grid item xs={12} align="center">
					<CircularProgress/>
				</Grid>
			</Grid>
		)
	}else {
		const md = entries.length >4 ? 3: (12/entries.length)
		if (entries.length === 1) {
			return (
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<EnrichmentPage {...EnrichmentPageProps} id={entries[0].data.id}/>
					</Grid>
				</Grid>
			)
		}else {
			return (
				<Grid container spacing={3}>
					{entries.map(entry=>(
						<Grid item xs={12} sm={6} md={md} key={entry.data.id} align="center">
							<IconComponentButton 
								subtitle={entry.info.name.text}
								description={entry.info.subtitle.text || entry.data.id}
								href={entry.info.endpoint}
								src={entry.info.icon.src}
								alt={entry.info.icon.alt}
								count={entry.data.scores.signature_count}
							/>
						</Grid>
					))}
				</Grid>
			)
		}
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
		SearchTabProps,
		ResourceTabProps,
		filters,
		ResultsProps,
		download_input,
		type,
		entries,
	} = props

	const [expanded, setExpanded] = React.useState(false);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))

	return(
		<Grid container spacing={1}  style={{marginBottom: 20}}>
			<Grid item xs={12} md={1}/>
			<Grid item xs={12} md={8}>
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
				{ entries!==null ?  <Collapse in={expanded} timeout="auto" unmountOnExit><SigForm {...props}/></Collapse>:
					<SigForm {...props}/>
				}
			</Grid>
			{ entries!==null ?
				<Grid item xs={12} md={3}>
					<Tooltip title="Click to view input" placement="bottom">
						
						<Button onClick={handleExpandClick}
							aria-expanded={expanded}
							aria-label="show more"
						>
							<span className="mdi mdi-note-text-outline mdi-24px"/>
						</Button>
					</Tooltip>
					<Tooltip title="Download Input" placement="bottom">
						
						<Button onClick={download_input}
							aria-label="download"
						>
							<span className="mdi mdi-download mdi-24px"/>
						</Button>
					</Tooltip>
				</Grid>: null
			}
			<Grid item xs={12} md={1}/>
			<Grid item xs={12} md={(entries || []).length === 1 ? 12: 8} style={{paddingTop: 50}}>
				<Results {...ResultsProps} type={type} searching={searching} entries={entries}/>
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
		visualization: PropTypes.objectOf(PropTypes.oneOf(['bar', 'scatter', 'table'])),
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
	download_input: PropTypes.func,
	TextFieldSuggestProps: PropTypes.shape({
		input: PropTypes.shape(PropTypes.oneOf([
			{
				valid: PropTypes.number,
				invalid: PropTypes.number,
				suggestions: PropTypes.number,
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
		resetInput: PropTypes.func.isRequired,
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
		suggestionsProps: PropTypes.object,
		toggleSwitch: PropTypes.func,
	}),
	enrichment_tabs: PropTypes.objectOf(PropTypes.oneOf([
		PropTypes.shape({
			label: PropTypes.string,
			href: PropTypes.string,
			type: PropTypes.string,
			icon: PropTypes.string,
			placeholder: PropTypes.string,
		}),
		PropTypes.shape({
			label: PropTypes.string,
			href: PropTypes.string,
			type: PropTypes.string,
			icon: PropTypes.string,
			up_placeholder: PropTypes.string,
			down_placeholder: PropTypes.string,
		})
	])),
	type: PropTypes.oneOf("Rank", "Overlap"),
}