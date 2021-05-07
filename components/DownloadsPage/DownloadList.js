import React, {useState, useEffect} from 'react'
import dynamic from 'next/dynamic'
import { labelGenerator } from "../../util/ui/labelGenerator";
import { build_where } from '../../connector/build_where'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const CircularProgress = dynamic(()=> import('@material-ui/core/CircularProgress'));
const Button = dynamic(()=> import('@material-ui/core/Button'));
const Avatar = dynamic(()=> import('@material-ui/core/Avatar'));
const List = dynamic(()=> import('@material-ui/core/List'));
const ListItem = dynamic(()=> import('@material-ui/core/ListItem'));
const ListItemIcon = dynamic(()=> import('@material-ui/core/ListItemIcon'));
const ListItemText = dynamic(()=> import('@material-ui/core/ListItemText'));
const ListItemSecondaryAction = dynamic(()=> import('@material-ui/core/ListItemSecondaryAction'));
const Downloads = dynamic(()=> import('../Downloads'));
const {IconComponent} = dynamic(()=> import('../DataTable/IconComponent'));

const get_entries = async ({resolver, search, limit=25, skip, model, schemas}) => {
	const where = build_where({search})
	const filter = {where, limit, skip}
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

const DownloadList = ({
	resolver,
	schemas,
	model
}) => {
	const [limit, setLimit] = useState(25)
	const [skip, setSkip] = useState(0)
	const [search, setSearch] = useState([])
	const [entries, setEntries] = useState(null)
	const [more, setMore] = useState(true)

	useEffect( () => {
		const r = async () => {
			const {entries: results , count} = await get_entries({
				resolver,
				model, 
				search,
				limit,
				skip,
				schemas
			})
			setEntries([...(entries || []), ...results])
			if (count < limit) setMore(false)
		}
		r()
	}, [search, limit, skip]);
	if (entries === null) return <CircularProgress/>
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<List>
					{entries.map(entry=>(
						<ListItem key={entry.data.id}>
							<ListItemIcon>
								<Avatar {...entry.info.icon}/>
							</ListItemIcon>
							<ListItemText id={entry.data.id}
								primary={entry.info.name.text}
								primaryTypographyProps={{
									style: {width: "90%"}
								}}
								secondary={entry.info.subtitle.text} 
								secondaryTypographyProps={{
									style: {width: "90%"}
								}}
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
