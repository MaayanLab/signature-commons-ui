import React from 'react'
import dynamic from 'next/dynamic'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const Card = dynamic(()=> import('@material-ui/core/Card'));
const CardHeader = dynamic(()=> import('@material-ui/core/CardHeader'));
const Button = dynamic(()=> import('@material-ui/core/Button'));
const Avatar = dynamic(()=> import('@material-ui/core/Avatar'));
const Typography = dynamic(()=> import('@material-ui/core/Typography'));

const Table = dynamic(()=>import('@material-ui/core/Table'));
const TableBody = dynamic(()=>import('@material-ui/core/TableBody'));
const TableCell = dynamic(()=>import('@material-ui/core/TableCell'));
const TableHead = dynamic(()=>import('@material-ui/core/TableHead'));
const TableRow = dynamic(()=>import('@material-ui/core/TableRow'));


export const DownloadTable = ({links, values}) => {
	if (values === undefined){
		values = links.map(({label, icon, href, ...rest})=>({
			icon: () => (
				<Avatar aria-label={label}>
					<span className={`mdi mdi-18px ${icon}`}/>
				</Avatar>
			),
			label,
			...rest,
			download: () => (
				<Button aria-label="add to favorites" target="_blank" rel="noopener noreferrer" href={href} style={{fontSize: 12}}>
					<span className="mdi mdi-24px mdi-download"/> 
				</Button>
			)
		}))
	}
	const headers = Object.keys(values[0] || {})

	return (
		<Table aria-label="download table" size="small" style={{width: '100'}}>
			<TableHead>
				<TableRow>
					{headers.map((h,i)=>(
					<TableCell align={h === "download"? "right": "left"}><b>{h === "icon" ? "": h}</b></TableCell>	  
					))}
				</TableRow>
			</TableHead>
			<TableBody>
				{values.map((row) => (
				<TableRow key={row.label}>
					{headers.map(h=>(
					<TableCell align={h === "download"? "right": "left"}>{h === "icon" || h === "download" ? row[h]() :row[h]}</TableCell>	  
					))}
				</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

const DownloadCards = ({links}) => {
	console.log(links)
	const cards = links.map(({label, icon, href, ...rest})=>(
		<Grid item xs={6} md={4} xl={3} key={label}>
		  <Card style={{minHeight: 300}}>
			<CardHeader
			  avatar={
				<Avatar aria-label={label}>
				  <span className={`mdi mdi-24px ${icon}`}/>
				</Avatar>
			  }
			  title={label}
			  subheader={
			  <React.Fragment>
				  {Object.entries(rest).map(([label, value])=>(
					<Typography variant="subtitle2">{`${label}: ${value}`}</Typography>
				  ))}
			  </React.Fragment>
			  }
			  style={{textAlign: "left", minHeight: 300, alignItems: "flex-start"}}
			  action={
				<Button aria-label="add to favorites" target="_blank" rel="noopener noreferrer" href={href} style={{fontSize: 12}}>
					<span className="mdi mdi-24px mdi-download"/> 
				</Button>
			  }
			/>
		  </Card>
		</Grid>
	  ))
	return cards
}

export default function Download( {download_links} ) {
	return (
	  <Grid container spacing={2}>
		{download_links.map(({label, links, description})=>(
			<React.Fragment key={label}>
				<Grid item xs={12}>
					<Typography variant={"h5"}>{label}</Typography>
				</Grid>
				{description === undefined ? null:
					<Grid item xs={12}>
						<Typography variant={"body2"}>{description}</Typography>
					</Grid>
				}
				<Grid item xs={12}>
					<DownloadTable links={links}/>
				</Grid>
			</React.Fragment>
		))}
	  </Grid>
	)
  }
  