import React, {useState, useEffect} from 'react'
import dynamic from 'next/dynamic'
import { labelGenerator } from "../../util/ui/labelGenerator";
import { build_where } from '../../connector/build_where'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const CircularProgress = dynamic(()=> import('@material-ui/core/CircularProgress'));
const Button = dynamic(()=> import('@material-ui/core/Button'));
const Typography = dynamic(()=> import('@material-ui/core/Typography'));
const Avatar = dynamic(()=> import('@material-ui/core/Avatar'));
const List = dynamic(()=> import('@material-ui/core/List'));
const ListItem = dynamic(()=> import('@material-ui/core/ListItem'));
const ListItemIcon = dynamic(()=> import('@material-ui/core/ListItemIcon'));
const ListItemText = dynamic(()=> import('@material-ui/core/ListItemText'));
const Downloads = dynamic(()=> import('../Downloads'));
const ChipInput = dynamic(async () => (await import('../SearchComponents/ChipInput')).ChipInput);
const TablePagination = dynamic(()=>import('@material-ui/core/TablePagination'));
const ResultsTab = dynamic(()=> import('../SearchComponents/ResultsTab'));

const get_entries = async ({resolver, search, limit=10, skip, model, schemas, sorted, fields}) => {
	const where = build_where({search})
	let filter = {
		where,
		limit,
		skip
	}
	if (sorted !== null) {
		filter = {
			...filter,
			where: {
				...(filter.where || {}),
				[sorted.field]: {neq: null}
			},
			order: [`${sorted.field} ${sorted.order}`]
		}
	}
	if (fields.length > 0 ){
		filter.where = {
			and: [
				{...filter.where},
				{or: [...fields]}
			]
		}
	}
	const { entries: resolved_entries, count } = await resolver.filter_metadata({model, filter})
	const entries = []
	for (const e of Object.values(resolved_entries)) {
		const ent = model === "signatures" ? await e.serialize(true, false): await e.entry()
		const entry = labelGenerator(ent, schemas)
		if (entry.info.components.download) {
			entries.push(entry)
		}
	}
	return {entries, count}
}

const sort_icons = {
	"ASC": <span className={"mdi mdi-arrow-up"}/>,
	"DESC": <span className={"mdi mdi-arrow-down"}/>
}

const field_filter = (fields=[]) => {
	const or = []
	for (const field of fields){
		or.push({
			[field]: {neq: null}
		})
	}
	return or
}

const DownloadList = ({
	resolver,
	schemas,
	download_list,
	preferred_name
}) => {
	const [tab, changeTab] = useState({...download_list[0]})
	const {model, sort, fields} = tab
	const nonnull_field = field_filter(fields)
	const [count, setCount] = useState(null)
	const [limit, setLimit] = useState(10)
	const [skip, setSkip] = useState(0)
	const [search, setSearch] = useState([])
	const [entries, setEntries] = useState(null)
	const [sorted, setSorted] = useState(null)

	const change_tab = (tab) => {
		setCount(null)
		changeTab(tab)
	}

	useEffect( ()=>{
		setLimit(10),
		setSkip(0)
		setSearch([])
		setEntries(null)
		setSorted(null)
		setCount(null)
	}, [tab])

	useEffect( ()=>{
		setLimit(10),
		setSkip(0)
		setSorted(null)
	}, [search])
	
	useEffect( () => {
		const r = async () => {
			const {entries: results , count} = await get_entries({
				resolver,
				model, 
				search,
				limit,
				skip,
				schemas,
				sorted, 
				fields: nonnull_field
			})
			setCount(count)
			setEntries(results)
		}
		r()
	}, [search, limit, skip, sorted]);
	// useEffect( () => {
	// 	const r = async () => {
	// 		const {entries: results , count} = await get_entries({
	// 			resolver,
	// 			model, 
	// 			search,
	// 			limit,
	// 			skip: 0,
	// 			schemas,
	// 			sorted
	// 		})
	// 		setEntries(results)
	// 		if (count < limit) setMore(false)
	// 	}
	// 	r()
	// }, [sorted]);

	if (entries === null){
		return(
			<Grid container spacing={2}>
				<Grid item xs={12} align="center">
					{download_list.length > 1 ?
						<ResultsTab 
							tabs={download_list.map(value=>({...value, 
								value: value.model,
								label: `${preferred_name[value.model]}${value.model===tab.model && count !== null ?'('+count+')': ''}`}))}
							value={tab.model}
							handleChange={change_tab}
							tabsProps={{centered: true}}
						/>: null
					}
				</Grid>
				<Grid item xs={12} md={5}>
					<ChipInput
						input={search}
						onSubmit={(term)=>{
							if (search.indexOf(term)<0) setSearch([...search, term])
						}}
						onDelete={ (term)=>{
								setSearch(search.filter(t=>t!==term))
							}
						}
						ChipInputProps={{
							divProps: {
								style: {
									background: "#f7f7f7",
									padding: 5,
									borderRadius: 25,
								}
							}
						}}
					/>
				</Grid>
				<Grid item xs={12} align="center" style={{marginTop: 10}}>
					<CircularProgress/>
				</Grid>
			</Grid>
		)
	} 
	return (
		<Grid container spacing={2}>
			{download_list.length > 1 ?
				<Grid item xs={12} align="center">
					<ResultsTab 
						tabs={download_list.map(value=>({...value, 
							value: value.model,
							label: `${preferred_name[value.model]}${value.model===tab.model && count !== null?' ('+count+')': ''}`}))}
						value={tab.model}
						handleChange={change_tab}
						tabsProps={{centered: true}}
					/>
				</Grid>:null
			}
			<Grid item xs={12} md={5}>
				<ChipInput
					input={search}
					onSubmit={(term)=>{
						if (search.indexOf(term)<0) setSearch([...search, term])
					}}
					onDelete={ (term)=>{
							setSearch(search.filter(t=>t!==term))
						}
					}
					ChipInputProps={{
						divProps: {
							style: {
								background: "#f7f7f7",
								padding: 5,
								borderRadius: 25,
							}
						}
					}}
				/>
			</Grid>
			<Grid item xs={12} md={7} align="right">
				{sort === null || sort.length === 0 ? null:
					sort.map(s=>(
						<Button 
							size="small"
							key={s.label}
							variant="contained"
							color={`${s.label === (sorted || {}).label ? "secondary" : "default"}`}
							startIcon={<span className={`mdi ${s.icon || 'mdi-sort'}`}/>}
							style={{
								margin: 2,
								borderRadius: 50
							}}
							endIcon={s.label === (sorted || {}).label ? sort_icons[(sorted || {}).order] : null}
							onClick={()=>{
								if (sorted === null || sorted.label !== s.label){
									setSorted(s)
									setSkip(0)
								} else {
									setSorted({
										...s,
										order: sorted.order === "ASC" ? "DESC": "ASC"
									})
									setSkip(0)
								}
							}}
						>
							{s.label}
						</Button>
					))
				}
			</Grid>
			<Grid item xs={12}>
				<List>
					{entries.map(entry=>(
						<ListItem key={`${entry.data.id}-${(sorted || {}).label}-${(sorted || {}).order}`}
								alignItems="flex-start">
							<ListItemIcon>
								<Avatar {...entry.info.icon}/>
							</ListItemIcon>
							<ListItemText id={entry.data.id}
								primary={entry.info.name.text}
								primaryTypographyProps={{
									style: {width: "90%"}
								}}
								secondary={<div>
									<Typography variant="body2" style={{width:"90%"}}>
										{entry.info.subtitle.text}
									</Typography>
									{entry.info.tags.map(t=>(
										<Typography key={t.label} variant="body2" style={{width:"90%"}}>
											<b>{t.label}:</b> {t.text}
										</Typography>
									))}
								</div>
								}
								style={{width: 400}}
							/>
							<Downloads {...entry.info.components.download.props} />
						</ListItem>
					))}
				</List>
			</Grid>
			<Grid item xs={12} align="right">
				<TablePagination
					component="div"
					align="right"
					count={count}
					rowsPerPage={limit}
					page={(skip/limit)}
					onChangePage={(event, newPage)=>setSkip(limit*newPage)}
					onChangeRowsPerPage={(event)=>setLimit(parseInt(event.target.value, 10))}
				/>
			</Grid>
		</Grid>
	)
}


export default DownloadList
