import React from 'react'
import PropTypes from 'prop-types'
import { useWidth } from '../../util/ui/useWidth'
import dynamic from 'next/dynamic'
const InfoCard = dynamic(async () => (await import('../DataTable')).InfoCard);
const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'))
const Card = dynamic(()=>import('@material-ui/core/Card'))
const CardContent = dynamic(()=>import('@material-ui/core/CardContent'))
const CardHeader = dynamic(()=>import('@material-ui/core/CardHeader'))

const UnexpandedCards = (entry) => {
	const comprops = {
		bar_props:{width: useWidth() === 'xl' ? 300: 230, barSize:20, maxHeight:270},
		scatter_props:{width:300, height:300},
	}
	return(
		<Grid item xs={12} sm={6} md={4}>
			<Card style={{maxHeight: entry.data.dataset_type === "geneset_library" ? 400: 670}}>
				<CardHeader
					// avatar={
					// 	<IconComponent {...entry.info.icon}/>
					// }
					title={<Typography variant="body2">{entry.info.name.text}</Typography>}
					action={
						entry.RightComponents.map((comp, i)=>{
							const {component, props} = comp
							return <div key={entry.data.id} style={{marginTop: 10}}>
										{component({
											...props,
											icon: "mdi-18px mdi-arrow-expand-all",
											text: "Expand",
										})}
								   </div>
						})
					}
					style={{paddingBottom: 0, height: 50}}
				/>
				<CardContent style={{paddingTop: 0}}>
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

const ExpandedCards = (entry) => (
	<Grid item xs={12}>
		<InfoCard {...entry}/>
	</Grid>
)

export const EnrichmentResult = (props) => {
	const {
		searching=false,
		entries,
		DataTableProps,
		label
	} = props
	const {expanded: expanded_id, RightComponent, BottomComponent} = DataTableProps
	const Component = expanded_id === null ? UnexpandedCards: ExpandedCards
	const children = []
	for (const entry of entries){
		const child = {
			...entry,
			BottomComponents: [{
				component: BottomComponent,
				props: {
					id: entry.data.id,
					expanded: entry.data.id === expanded_id,
					expanded_id
				}
			}],
			RightComponents: [{
				component: RightComponent,
				props: {
					id: entry.data.id,
					icon: entry.data.id === expanded_id ? "mdi-18px mdi-arrow-collapse-all": "mdi-18px mdi-arrow-expand-all",
					text: entry.data.id === expanded_id ? "Collapse": "Expand"
				}
			}]
		}
		children.push(<Component key={entry.data.id} {...child}/>)
	}
	return(
		<Grid container spacing={1}>
			<Grid item xs={12}>
				{searching?<CircularProgress/>:
					<Grid container spacing={1}>
						<Grid item xs={12}>
							<Typography variant={"body1"} style={{marginBottom: 10}}>{label}</Typography>
						</Grid>
						<Grid item xs={12}>
							<Grid container spacing={2}>
								{children}
							</Grid>
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