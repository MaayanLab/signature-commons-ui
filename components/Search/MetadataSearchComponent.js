import React from 'react'
import PropTypes from 'prop-types'
import { ChipInput, Filter } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {ResultsTab} from '../MetadataPage/ResultsTab'
import {DataTable} from '../DataTable'
import { Typography, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'


export const MetadataSearchComponent = (props) => {
	const {
		searching=false,
		search_terms=[],
		search_examples=[],
		chipRenderer,
		filters,
		onSearch,
		onFilter,
		entries,
		DataTableProps,
		PaginationProps,
		ModelTabProps,
		SearchTabProps,
		TabProps,
	} = props

	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))

	return(
		<Grid container spacing={1}>
			<Grid item xs={12} md={2}/>
			<Grid item xs={12} md={6} lg={7}>
				<Grid container spacing={1}>
					{/* Search Components */}
					<Grid item xs={12}>
						{ SearchTabProps.tabs.length < 2 ? null:
							<ResultsTab
								tabsProps={{
									centered: true,
									variant: "fullWidth",
								}}
								tabProps={{
									style:{
										minWidth: 100
									}
								}}
								divider
								{...SearchTabProps}
							/>
						}
						<ResultsTab
							{...ModelTabProps}
						/>
						<ChipInput 
							input={search_terms}
							onSubmit={(term)=>{
								if (search_terms.indexOf(term)<0) onSearch([...search_terms, term])
							}}
							onDelete={ (term)=>{
									onSearch(search_terms.filter(t=>t!==term))
								}
							}
							chipRenderer={chipRenderer}
							ChipInputProps={{
								divProps: {
									style: {
										background: "#f7f7f7",
										marginTop: 10
									}
								}
							}}
						/>
					</Grid>
					<Grid item xs={12} align="center">
						{searching ? 
							<Button variant="contained" color="primary" size="small" style={{height: 40}}>
								<span class="mdi mdi-loading mdi-spin mdi-24px" /><Typography align={"center"}>Searching...</Typography>
							</Button>
						:
							<Button variant="contained" color="primary" size="small" style={{height: 40}}>
								<span className="mdi mdi-magnify mdi-24px" /><Typography align={"center"}>Search</Typography>
							</Button>
						}
						<Typography align={"center"}  style={{marginTop:10}}>
						{search_examples.map((v,i)=>(
							<React.Fragment>
								<Button variant="text" color="primary" style={{fontSize:10}} onClick={()=>{
									if (search_terms.indexOf(v)<0) onSearch([...search_terms, v])
								}}>
									{v}
								</Button>
								{i === search_examples.length - 1 ? null: "/"}
							</React.Fragment>
						))}
						</Typography>
						<ResultsTab
							tabsProps={{
								centered: true,
							}}
							{...TabProps}
						/>
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container spacing={1}>
					<Grid item xs={12} md={2} lg={2}/>
					<Grid item xs={12} md={6} lg={7}>
						{ entries===null ? <CircularProgress/>:
							<Grid item xs={12}>
								<DataTable entries={entries} {...DataTableProps}/>
								<TablePagination
									{...PaginationProps}
									component="div"
									align="right"
								/>
							</Grid>
						}
					</Grid>
					<Grid item xs={12} md={4} lg={3} align="center">
						{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>onFilter(filter.field, e.target.value)}/>)}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

MetadataSearchComponent.propTypes = {
	searching: PropTypes.bool,
	search_terms: PropTypes.arrayOf(PropTypes.string),
	search_examples: PropTypes.arrayOf(PropTypes.string),
	chipRenderer: PropTypes.func,
	filters: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		field: PropTypes.string,
		priority: PropTypes.number,
		values: PropTypes.objectOf(PropTypes.number),
		checked: PropTypes.objectOf(PropTypes.bool),
	})),
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
	ModelTabProps: PropTypes.shape({
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
	}).isRequired
}