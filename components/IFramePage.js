import React, { useState } from 'react'
import PropTypes from 'prop-types'
import iFrame from './IFrame'
import {ResultsTab} from './MetadataPage/ResultsTab'
import Grid from '@material-ui/core/Grid'

export const IFramePage = (props) => {
	const [open, setOpen] = React.useState(Object.keys(props.iframe)[0]);

	const handleOpen = (val) => {
		setOpen(val.value);
	};
	const iframes = {}
	for (const val of Object.values(props.iframe)){
		iframes[val.id] = <iFrame width="100%" {...val} />
	}
	return(
		<Grid container spacing={1}>
			<Grid xs={12} align="center">
				{ Object.keys(props.iframe).length>1 ?
					<ResultsTab 
						tabs={Object.values(props.iframe).map(i=>({
							label: i.name,
							value: i.id,
						}))}
						value={open}
						handleChange={handleOpen}
						tabsProps={{centered: true}}
					/>: null
				}		
				{iframes[open]}
			</Grid>
		</Grid>
	)
}