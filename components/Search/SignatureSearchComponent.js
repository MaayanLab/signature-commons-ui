import React from 'react'
import PropTypes from 'prop-types'
import { TextFieldSuggest } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {ResultsTab} from '../MetadataPage/ResultsTab'
import {DataTable} from '../DataTable'
import { Typography, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';


export const SignatureSearchComponent = (props) => {
	const {
		searching=false,
		search_terms=[],
		search_examples=[],
		chipRenderer,
		onSearch,
		entries,
		DataTableProps,
		PaginationProps,
		SearchTabProps,
		TabProps,
		TextFieldSuggestProps,
		field,
	} = props


	return(
		<Grid container spacing={1}>
			<Grid item xs={12} md={4} lg={3}>
				<Grid container>
					<Grid item xs={12}>
						{ SearchTabProps.tabs.length < 2 ? null:
							<ResultsTab
								tabsProps={{
									centered: true,
									variant: "fullWidth",
								}}
								tabProps={{
									wrapped: true,
									style:{
										minWidth: 100
									}
								}}
								divider
								{...SearchTabProps}
							/>
						}
					</Grid>
					<Grid item xs={12} style={{marginTop: 10}}>
						{TextFieldSuggestProps.input.entities !== undefined ?
							<TextFieldSuggest {...TextFieldSuggestProps}
									input={Object.values(TextFieldSuggestProps.input.entities)}
									onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "entities")}
									onSubmit={(value)=>TextFieldSuggestProps.onSubmit(value, "entities")}
									onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "entities")}
									onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "entities")}
							/>:
							<React.Fragment>
								<TextFieldSuggest {...TextFieldSuggestProps}
									input={Object.values(TextFieldSuggestProps.input.up_entities)}
									onAdd={(value)=>TextFieldSuggestProps.onAdd(value, "up_entities")}
									onSubmit={(value)=>TextFieldSuggestProps.onSubmit(value, "up_entities")}
									onDelete={(value)=>TextFieldSuggestProps.onDelete(value, "up_entities")}
									onSuggestionClick={(value, selected)=>TextFieldSuggestProps.onSuggestionClick(value, selected, "up_entities")}
								/>
								<TextFieldSuggest {...TextFieldSuggestProps}
									input={Object.values(TextFieldSuggestProps.input.down_entities)}
									onAdd={(value)=>onAdd(value, "down_entities")}
									onSubmit={(value)=>onSubmit(value, "down_entities")}
									onDelete={(value)=>onDelete(value, "down_entities")}
									onSuggestionClick={(value, selected)=>onSuggestionClick(value, selected, "down_entities")}
								/>
							</React.Fragment>
						}
						
					</Grid>
					<Grid item xs={12} align="center">
						{searching ? 
							<Button variant="contained" color="primary" size="small" style={{marginTop:10}}>
								<span class="mdi mdi-loading mdi-spin mdi-24px" /><Typography align={"center"}>Searching...</Typography>
							</Button>
						:
							<Button variant="contained" color="primary" size="small" style={{marginTop:10}}>
								<span className="mdi mdi-magnify mdi-24px" /><Typography align={"center"}>Search</Typography>
							</Button>
						}
					</Grid>
				</Grid>
				<Typography align={"center"}  style={{marginTop:10}}>
				{search_examples.map((v,i)=>(
					<React.Fragment>
						<Button variant="text" color="primary" onClick={()=>{
							if (search_terms.indexOf(v)<0) onSearch([...search_terms, v])
						}}>
							{v}
						</Button>
						{i === search_examples.length - 1 ? null: " / "}
					</React.Fragment>
				))}
				</Typography>
			</Grid>
			<Grid item xs={12} md={6} lg={7}>
				<ResultsTab
					tabsProps={{
						centered: true,
					}}
					{...TabProps}
				/>
				<DataTable entries={entries} {...DataTableProps}/>
				<TablePagination
					{...PaginationProps}
					component="div"
					align="right"
				/>
			</Grid>
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
	entries: PropTypes.arrayOf(PropTypes.object).isRequired,
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
	TabProps: PropTypes.shape({
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
		input: PropTypes.arrayOf(PropTypes.shape({
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
		})).isRequired,
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