import React from 'react'
import PropTypes from 'prop-types'
import { ChipInput, Filter } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {ResultsTab} from './ResultsTab'
import {DataTable, ShowMeta} from '../DataTable'
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup'

export const SearchResult = (props) => {
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
		TabProps,
	} = props

	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))

	return(
		<Grid container spacing={1}>
			<Grid item xs={12} md={4} lg={3}>
				<Grid container>
					<Grid item xs={12}>
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
						/>
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
					<Grid item xs={12} align="center">
						{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>onFilter(filter.field, e.target.value)}/>)}
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
			<Grid item xs={12} md={8} lg={9}>
				<ResultsTab
					tabsProps={{
						centered: true
					}}
					{...TabProps}
				/>
				<DataTable entries={entries}/>
				<TablePagination
					{...PaginationProps}
					component="div"
					align="right"
				/>
			</Grid>
		</Grid>
	)
}

SearchResult.propTypes = {
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
	TabProps: PropTypes.shape({
		tabs: PropTypes.arrayOf(PropTypes.shape({
			label: PropTypes.string.isRequired,
			href: PropTypes.string,
			count: PropTypes.number,
			value: PropTypes.string,
		})),
		value: PropTypes.string.isRequired,
		handleChange: PropTypes.func,
		tabsProps: PropTypes.object,
	}).isRequired
}