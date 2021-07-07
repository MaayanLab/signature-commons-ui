import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'
const ChipInput = dynamic(async () => (await import('../SearchComponents')).ChipInput);
const Filter = dynamic(async () => (await import('../SearchComponents')).Filter);
const DataTable = dynamic(async () => (await import('../DataTable')).DataTable);

const Box = dynamic(()=>import('@material-ui/core/Box'));
const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const TablePagination = dynamic(()=>import('@material-ui/core/TablePagination'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Button = dynamic(()=>import('@material-ui/core/Button'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const Hidden = dynamic(()=>import('@material-ui/core/Hidden'));

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
		label
	} = props

	const sorted_filters = filters.sort((a,b)=>((a.priority || a.field) - (b.priority || b.field)))

	return(
		<Grid container spacing={1}>
			<Hidden smDown>
				<Grid item md={8} lg={9}>
					{searching &&
						<Box align="center">
							<CircularProgress/>
						</Box>
					}
					{!searching &&
						<React.Fragment>
							<Typography variant={"h6"} style={{marginBottom: 10}}>{label}</Typography>
							<DataTable entries={entries} {...DataTableProps}/>
							{entries.length > 0 &&
								<TablePagination
									{...PaginationProps}
									component="div"
									align="right"
								/>
							}
						</React.Fragment>
					}
				</Grid>
				<Grid item md={4} lg={3}>
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
									borderRadius: 25
								}
							},
							inputProps: {
								placeholder: search_terms.length === 0 ? "Search for any term": "",
							}
						}}
					/>
					{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>onFilter(filter.field, e.target.value)}/>)}
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
			</Hidden>
			<Hidden mdUp>
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
						ChipInputProps={{
							divProps: {
								style: {
									background: "#f7f7f7", 
									borderRadius: 25
								}
							},
							inputProps: {
								placeholder: search_terms.length === 0 ? "Search for any term": "",
							}
						}}
					/>
					{sorted_filters.map(filter=><Filter key={filter.field} {...filter} onClick={(e)=>onFilter(filter.field, e.target.value)}/>)}
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
				<Grid item xs={12}>
					{!searching &&
						<React.Fragment>
							<Typography variant={"h6"} style={{marginBottom: 10}}>{label}</Typography>
							<DataTable entries={entries} {...DataTableProps}/>
							{entries.length > 0 &&
								<TablePagination
									{...PaginationProps}
									component="div"
									align="right"
								/>
							}
						</React.Fragment>
					}
				</Grid>
			</Hidden>
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