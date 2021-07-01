import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import { useWidth } from '../../util/ui/useWidth'

import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const Switch = dynamic(()=>import('@material-ui/core/Switch'));
const Tabs = dynamic(()=>import('@material-ui/core/Tabs'));
const Tab = dynamic(()=>import('@material-ui/core/Tab'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Collapse = dynamic(()=>import('@material-ui/core/Collapse'));
const TextFieldSuggest = dynamic(()=>import('../SearchComponents/TextFieldSuggest'));
const EnrichmentPage = dynamic(()=>import('../MetadataPage/EnrichmentPage'));
const IconComponentButton = dynamic(async () => (await import('../DataTable')).IconComponentButton);
const ResultsTab = dynamic(async () => (await import('../SearchComponents/ResultsTab')).ResultsTab);
const GeneSearch = dynamic(()=>import('../GeneSearch'));
const About = dynamic(()=>import('../About'));



const Examples = (props) => {
	const {examples=[], type, onAdd, resetInput} = props
	const example_buttons = []
	for (const ex of examples){
		let component = (
			<Button variant="text" color="primary" style={{textTransform: "none"}} onClick={()=>{
				resetInput()
				if (type === "Overlap") {
					onAdd(ex.input.entities, "entities")
				} else {
					onAdd(ex.input.up_entities, "up_entities")
					onAdd(ex.input.down_entities, "down_entities")
				}
			}}>
				<Typography variant="subtitle2">{ex.label}</Typography>
			</Button>
		)
		if (ex.link!==undefined){
			component = (
				<React.Fragment>
					{component}
					<Button 
						style={{minWidth: 5}}
						href={ex.link}
						target = "_blank" 
						rel = "noopener noreferrer" 
					>
						<span className="mdi mdi-open-in-new"/>
					</Button>
				</React.Fragment>
			)
		}
		example_buttons.push(<div key={ex.label} >{component}</div>)
	}
	return example_buttons
}

const EntityCounts = (props) => {
	const { valid=0, invalid=0, suggestions=0 } = props
	if (valid || invalid || suggestions){
		return(
			<div style={{position: "absolute", top: 20, right: 10}}>
				{valid ?
					<Typography variant="caption" color="primary">
						{`${valid} valid ${valid > 1 ? "entries": "entry"}`}<br/>
					</Typography>:
					null
				}
				{invalid ?
					<Typography variant="caption" color="error">
						{`${invalid} invalid ${invalid > 1 ? "entries": "entry"}`}<br/>
					</Typography>:
					null
				}
				{suggestions ?
					<Typography variant="caption" >
						{`${suggestions} ${suggestions > 1 ? "need": "needs"} review`}<br/>
					</Typography>:
					null
				}
			</div>
		)
	}else return null
}

const reorder_entities = (entities) => {
	const by_type = {
		suggestions: [],
		invalid: [],
		valid: [],
		loading: [],
	}
	for (const e of Object.values(entities)) {
		by_type[e.type].push(e)
	}
	return [...by_type.suggestions, ...by_type.valid, ...by_type.invalid, ...by_type.loading]
}

const SigForm = (props={}) => {
	const {
		searching=false,
		TextFieldSuggestProps,
		resolving,
		submitName="Search",
		enrichment_tabs,
		type,
		submit
	} = props
	let input = TextFieldSuggestProps.input
	// useEffect(()=>{
	// 	console.log(reset)
    //     if (reset) {
	// 		const i = resetInput()
	// 		const input_length = Object.values(input).reduce((acc,i)=>acc+Object.keys(i).length, 0)
	// 		if (input_length > 0){
	// 			input = i
	// 		}
    //     }
	// 	// setResetter(false)
    // },[reset])
	// console.log(input)
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
			<Grid item xs={12} align="left">
				{type === 'Overlap' ?
					<React.Fragment>
						<TextFieldSuggest {...TextFieldSuggestProps}
							input={reorder_entities(input.entities)}
							onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
							onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "entities")}
							onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "entities")}
							endAdornment={<EntityCounts {...props} {...input.set_stats}/>}
							placeholder={enrichment_tabs.Overlap.placeholder}
						/>
					</React.Fragment>
					:
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<TextFieldSuggest {...TextFieldSuggestProps}
								input={reorder_entities(input.up_entities)}
								onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
								onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
								onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "up_entities")}
								onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "up_entities")}
								placeholder={enrichment_tabs.Rank.up_placeholder}
								endAdornment={<EntityCounts {...input.up_stats}/>}
							/>
						</Grid>
						<Grid item xs={6} md={6}>
							<TextFieldSuggest {...TextFieldSuggestProps}
								input={reorder_entities(input.down_entities)}
								onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
								onSubmit={(value)=>TextFieldSuggestProps.onAdd(value, "down_entities")}
								onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "down_entities")}
								onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "down_entities")}
								placeholder={enrichment_tabs.Rank.down_placeholder}
								endAdornment={<EntityCounts {...props} {...input.down_stats}/>}
							/>
						</Grid>
					</Grid>
				}
			</Grid>
			{submit &&
			<Grid item xs={12} align="center">
				<div style={{
					margin: "auto",
					position: 'relative',}}>
					<Button variant="contained" color="primary" size="small" disabled={searching || resolving || TextFieldSuggestProps.disabled} style={{marginTop:10, textTransform: 'none'}} onClick={()=>TextFieldSuggestProps.onSubmit()}>
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
			}
		</Grid>
	)
}


const Results = (props) => {
	const {
		entries,
		searching,
		EnrichmentPageProps,
		header="",
		loading,
	} = props
	if (loading){
		return(
			<Grid container spacing={3}>
				<Grid item xs={12} align="center">
					<CircularProgress/>
				</Grid>
			</Grid>
		)
	} 
	else if (entries === null && !searching) return null
	else if (searching) {
		return null
	}else {
		const md = entries.length >4 ? 3: (12/entries.length)
		if (entries.length === 1) {
			return (
				<Grid container spacing={3}>
					<Grid item xs={11}>
						<EnrichmentPage {...EnrichmentPageProps} id={entries[0].data.id}/>
					</Grid>
				</Grid>
			)
		}else {
			return (
				<Grid container spacing={3}>
					{ header === "" ? null :
						<React.Fragment>
							<Grid item xs={1}/>
							<Grid item xs={11}>
								<Typography variant={'body1'} style={{marginBottom: 20}}>
									{header}
								</Typography>
							</Grid>
						</React.Fragment>
					}
					{entries.map(entry=>(
						<Grid item xs={6} md={md} key={entry.data.id} align="center">
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
		ui_values,
		description,
		ResultsProps,
		download_input,
		type,
		entries,
		resolver,
		schemas,
		enrichment_id,
		serverSideProps,
	} = props
	const [expanded, setExpanded] = useState(false);
	const width = useWidth()
	const breakpoint_md = 6

	useEffect(()=>{
        setExpanded(false)
    },[enrichment_id])

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	return(
		<Grid container spacing={1}  style={{marginBottom: 20}}>
			<Grid item xs={2}/>
			<Grid item xs={8} align="center">
				{ SearchTabProps.tabs.length < 2 ? null:
					<ResultsTab
						tabsProps={{
							centered: true
						}}
						tabProps={{
							style:{
								minWidth: 180
							}
						}}
						divider
						bold={true}
						{...SearchTabProps}
					/>
				}
			</Grid>
			{ enrichment_id!==undefined ?
				<Grid item xs={2} align="left">						
					<Tooltip title="Click to view input" placement="bottom">
						<Button onClick={handleExpandClick}
							aria-expanded={expanded}
							aria-label="show more"
						>
							<span className={`mdi ${expanded ? 'mdi-chevron-up': 'mdi-chevron-down'} mdi-24px`}/>
						</Button>
					</Tooltip>
					<Tooltip title="Download Input" placement="bottom">							
						<Button onClick={download_input}
							aria-label="download"
						>
							<span className="mdi mdi-download mdi-24px"/>
						</Button>
					</Tooltip>
				</Grid>
				: null
			}			
			<Grid item xs={ enrichment_id===undefined ? 12: 10} align="center" >
				<Collapse in={expanded || enrichment_id===undefined} timeout={0} unmountOnExit>
					<Grid container spacing={3}>
						{enrichment_id!==undefined ? <Grid item xs={2}/>:
							<Grid item xs={12} align="center">
								<Typography variant="body1" style={{marginTop: 10}}>{description}</Typography>
							</Grid>
						}
						<Grid item xs={12} md={enrichment_id===undefined ? breakpoint_md: 10} align={enrichment_id===undefined ? "right": "center"}>
							<SigForm {...props} submit={enrichment_id===undefined}/>
						</Grid>
						{enrichment_id!==undefined ? null:
							<Grid item xs={12} md={12-breakpoint_md} align={"center"}>
								<GeneSearch resolver={resolver} schemas={schemas} ui_values={ui_values}/>
							</Grid>
						}
					</Grid>
				</Collapse>
			</Grid>
			<Grid item xs={12}>
				<Results {...ResultsProps}
					type={type}
					loading={enrichment_id!==undefined && entries === null}
					searching={searching}
					entries={entries}
					download_input={download_input}
					handleExpandClick={handleExpandClick}
					expanded={expanded}
				/>
			</Grid>
			<Grid item xs={12}>
				{ enrichment_id===undefined && <About ui_values={ui_values} stats={serverSideProps}/>}
			</Grid>
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