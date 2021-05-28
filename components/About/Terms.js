import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export const Terms = (props) => (
	<Grid container alignItems={"center"}>
		<Grid item md={2}/>
		<Grid item xs={12} md={8}>
			<Typography variant="h4">
				Terms of Use
			</Typography>
			<Typography align="justify">
				<ReactMarkdown plugins={[gfm]} children={props.terms}/>
			</Typography>
		</Grid>
	</Grid>
)

export default Terms