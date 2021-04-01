import React from 'react'
import PropTypes from 'prop-types'
import { ChipInput } from '../SearchComponents'
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination'
import {DataTable} from '../DataTable'
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

export const EnrichmentResult = (props) => {
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
		label
	} = props

	return(
		<Grid container spacing={1}>
			<Grid item xs={12}>
				{searching?<CircularProgress/>:
					<Grid container spacing={1}>
						<Grid item xs={12}>
							<Typography variant={"h6"} style={{marginBottom: 10}}>{label}</Typography>
						</Grid>
						<Grid item xs={12}>
							<DataTable entries={entries} {...DataTableProps}/>
						</Grid>
					</Grid>
				}
			</Grid>
		</Grid>
	)
}

EnrichmentResult.propTypes = {
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