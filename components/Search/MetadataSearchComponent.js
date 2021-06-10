import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'
import { useWidth } from '../../util/ui/useWidth'
const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const TablePagination = dynamic(()=>import('@material-ui/core/TablePagination'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Button = dynamic(()=>import('@material-ui/core/Button'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const ChipInput = dynamic(async () => (await import('../SearchComponents/ChipInput')).ChipInput);
const Filter = dynamic(async () => (await import('../SearchComponents/Filter')).Filter);
const ResultsTab = dynamic(async () => (await import('../SearchComponents/ResultsTab')).ResultsTab);
const DataTable = dynamic(async () => (await import('../DataTable')).DataTable);
const CarouselComponent = dynamic(async () => (await import('../SearchComponents/CarouselComponent')).CarouselComponent);

export const MetadataSearchComponent = (props) => {
	const {
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
		placeholder,
		searching,
		homepage,
		PaperProps,
		tutorial,
		description
	} = props

	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))
	return(
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
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
				<Typography variant="body1" style={{marginTop: 10}}>{description}</Typography>
			</Grid>
			<Grid item xs={2}/>
			<Grid item xs={8} align="center">
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
								marginTop: 10,
								padding: 10,
								borderRadius: 25,
							}
						},
						inputProps: {
							placeholder: search_terms.length === 0 ? placeholder: "",
						}
					}}
				/>
				<Typography align={"center"} style={{height:30}}>
					{search_examples.map((v,i)=>(
						<React.Fragment>
							<Button variant="text" color="primary" style={{textTransform: "none"}} onClick={()=>{
								if (search_terms.indexOf(v)<0) onSearch([v])
							}}>
								<Typography variant="caption">{v}</Typography>
							</Button>
							{i === search_examples.length - 1 ? null: "/"}
						</React.Fragment>
					))}
				</Typography>
			</Grid>
			{ ModelTabProps.tabs.length === 0 ? null:
				<Grid item xs={12} align="center">
					<ResultsTab
						tabsProps={{
							centered: true,
							variant: "fullWidth",
						}}
						divider
						{...ModelTabProps}
					/>
				</Grid>
			}
			{ homepage ?
				<Grid item xs={12} style={{marginTop: 10, marginBottom: 25}} align="Center">
					<CarouselComponent {...tutorial}
						PaperProps={PaperProps}
						ContainerProps={{
							style:{
								height: useWidth() === 'xl' ? 350: 200,
								width: "100%"
							}
						}}
					/>
				</Grid>
				:
				<React.Fragment>
					<Grid item xs={12} md={2}/>
					<Grid item xs={12} md={7}>
						{ entries===null || searching ? <CircularProgress/>:
							<React.Fragment>
								<DataTable entries={entries} {...DataTableProps}/>
								<TablePagination
									{...PaginationProps}
									component="div"
									align="right"
								/>
							</React.Fragment>
						}
					</Grid>
					<Grid item xs={12} md={3}>
						{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>onFilter(filter.field, e.target.value)}/>)}
					</Grid>
				</React.Fragment>
			}
		</Grid>
	)
}

MetadataSearchComponent.propTypes = {
	searching: PropTypes.bool,
	homepage: PropTypes.bool,
	placeholder: PropTypes.string,
	landing_md: PropTypes.string,
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