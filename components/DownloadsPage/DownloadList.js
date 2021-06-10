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
const ListItemSecondaryAction = dynamic(()=> import('@material-ui/core/ListItemSecondaryAction'));
const Downloads = dynamic(()=> import('../Downloads'));
const ChipInput = dynamic(async () => (await import('../SearchComponents/ChipInput')).ChipInput);

const get_entries = async ({resolver, search, limit=25, skip, model, schemas, sorted}) => {
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
	const { entries: resolved_entries } = await resolver.filter_metadata({model, filter})
	const entries = []
	let count = 0
	for (const e of Object.values(resolved_entries)) {
		count = count + 1
		const entry = labelGenerator(await e.entry(), schemas)
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

const DownloadList = ({
	resolver,
	schemas,
	tab
}) => {
	const {model, sort} = tab
	const [limit, setLimit] = useState(25)
	const [skip, setSkip] = useState(0)
	const [search, setSearch] = useState([])
	const [entries, setEntries] = useState(null)
	const [more, setMore] = useState(true)
	const [sorted, setSorted] = useState(null)

	useEffect( () => {
		const r = async () => {
			const {entries: results , count} = await get_entries({
				resolver,
				model, 
				search,
				limit,
				skip,
				schemas,
				sorted
			})
			if (skip > 0) setEntries([...(entries || []), ...results])
			else setEntries(results)
			if (count < limit) setMore(false)
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
	if (entries === null) return <CircularProgress/>
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={6}>
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
			<Grid item xs={12} md={6} align="right">
				{sort === undefined || sort.length === 0 ? null:
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
							<ListItemSecondaryAction>
								<Downloads {...entry.info.components.download.props} />
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			</Grid>
			{ more ?
				<Grid item xs={12} align="right">
					<Button onClick={()=>setSkip(skip+limit)} style={{marginRight: -15}}>
						<Grid container>
							<Grid item xs={12}>
								<span className="mdi mdi-dots-horizontal mdi-36px"/>
							</Grid>
							<Grid item xs={12}>
								<span>See More</span>
							</Grid>
						</Grid>
					</Button>
				</Grid>
				: null
			}
		</Grid>
	)
}


export default DownloadList
