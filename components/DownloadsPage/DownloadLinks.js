import React from 'react'
import dynamic from 'next/dynamic'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const Card = dynamic(()=> import('@material-ui/core/Card'));
const CardActions = dynamic(()=> import('@material-ui/core/CardActions'));
const CardHeader = dynamic(()=> import('@material-ui/core/CardHeader'));
const Button = dynamic(()=> import('@material-ui/core/Button'));
const Avatar = dynamic(()=> import('@material-ui/core/Avatar'));
const Typography = dynamic(()=> import('@material-ui/core/Typography'));

const DownloadCards = ({links}) => {
	const cards = links.map(({label, icon, href, size, date})=>(
		<Grid item xs={6} md={3} key={label}>
		  <Card style={{width: 250, minHeight: 150}}>
			<CardHeader
			  avatar={
				<Avatar aria-label={label}>
				  <span className={`mdi mdi-24px ${icon}`}/>
				</Avatar>
			  }
			  title={label}
			  subheader={
			  <React.Fragment>
				  <Typography variant="subtitle2">{`Size: ${size}`}</Typography>
				  <Typography variant="subtitle2">{`Date: ${date}`}</Typography>
			  </React.Fragment>
			  }
			  style={{textAlign: "left", minHeight: 150}}
			/>
			<CardActions disableSpacing>
			  <Button aria-label="add to favorites" target="_blank" rel="noopener noreferrer" href={href} style={{fontSize: 12}}>
				<span className="mdi mdi-24px mdi-download"/> Download 
			  </Button>
			</CardActions>
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
						<Typography variant={"body1"}>{description}</Typography>
					</Grid>
				}
				<DownloadCards links={links}/>
			</React.Fragment>
		))}
	  </Grid>
	)
  }
  