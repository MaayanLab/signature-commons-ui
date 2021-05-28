import React, { useState } from 'react'
import dynamic from 'next/dynamic'
const IFrame = dynamic(()=> import('./IFrame'));
const ResultsTab = dynamic(()=> import('./SearchComponents/ResultsTab'));
const Grid = dynamic(()=> import('@material-ui/core/Grid'));


export const IFramePage = (props) => {
	const [open, setOpen] = useState(Object.keys(props.iframe)[0]);

	const handleOpen = (val) => {
		setOpen(val.value);
	};
	const iframes = {}
	for (const val of Object.values(props.iframe)){
		iframes[val.id] = <IFrame width="100%" {...val} />
	}
	return(
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
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

export default IFramePage