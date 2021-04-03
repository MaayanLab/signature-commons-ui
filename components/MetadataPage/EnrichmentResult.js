import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import {DataTable} from '../DataTable'
import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader';
import {IconComponent} from '../DataTable/IconComponent'

const UnexpandedCards = (props) => {
	const entry = props.entry
	const comprops = props.md === 4 ? {
		bar_props:{width:300, barSize:24, maxHeight:350},
		scatter_props:{width:350, height:350},
		expanded: false
	} : {
		bar_props:{width:400, barSize:27, maxHeight:350},
		scatter_props:{width:450, height:450},
		expanded: false
	}
	return(
		<Grid item xs={12} sm={6} md={props.md}>
			<Card style={{minHeight: 1350}}>
				<CardHeader
					avatar={
						<IconComponent {...entry.info.icon}/>
					}
					title={<Typography variant="h6">{entry.info.name.text}</Typography>}
					action={
						entry.RightComponents.map((comp, i)=>{
							const {component, props} = comp
							return <div key={entry.data.id}>
										{component(props)}
								   </div>
						})
					}
				/>
				<CardContent>
					{entry.BottomComponents.map((comp, i)=>{
						const {component, props} = comp
						return <div key={entry.data.id}>
									{component({...props,
											...comprops,
										})}
							   </div>
					})}
				</CardContent>
			</Card>
		</Grid>
	)
}

export const EnrichmentResult = (props) => {
	const {
		searching=false,
		entries,
		DataTableProps,
		label
	} = props
	const expanded_id = DataTableProps.expanded || ''
	const expanded_entry = []
	const unexpanded_entries = []
	for (const entry of entries){
		if (expanded_id === entry.data.id) expanded_entry.push(entry)
		else unexpanded_entries.push(entry)
	}
	return(
		<Grid container spacing={1}>
			<Grid item xs={12}>
				{searching?<CircularProgress/>:
					<Grid container spacing={1}>
						<Grid item xs={12}>
							<Typography variant={"h4"} style={{marginBottom: 10}}>{label}</Typography>
						</Grid>
						<Grid item xs={12}>
							<DataTable entries={expanded_entry} {...DataTableProps}/>
						</Grid>
						{unexpanded_entries.map(entry=>(
							<UnexpandedCards entry={entry} md={unexpanded_entries.length<3 ? 6:4} />
						))}
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