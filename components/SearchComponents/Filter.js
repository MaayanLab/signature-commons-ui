import React from 'react'
import PropTypes from 'prop-types'

import dynamic from 'next/dynamic'
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Card = dynamic(()=>import('@material-ui/core/Card'));
const CardHeader = dynamic(()=>import('@material-ui/core/CardHeader'));
const Collapse = dynamic(()=>import('@material-ui/core/Collapse'));
const IconButton = dynamic(()=>import('@material-ui/core/IconButton'));
const FormGroup = dynamic(()=>import('@material-ui/core/FormGroup'));
const FormControlLabel = dynamic(()=>import('@material-ui/core/FormControlLabel'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const Checkbox = dynamic(()=>import('@material-ui/core/Checkbox'));
const Grid = dynamic(()=>import('@material-ui/core/Grid'));


export const Filter = (props) => {
	const {
		name,
		icon="mdi-filter",
		values,
		checked,
		onClick,
		loading,
	} = props
	const [expanded, setExpanded] = React.useState(Object.keys(checked).length>0);
	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	if (loading){
		return (
			<Card>
				<CardHeader
					avatar={<span className={`mdi ${icon} mdi-48px`}></span>}
					action={<CircularProgress />}
					title={name}
				/>
			</Card>
		)
	}
	const sorted_values = Object.entries(values).sort((a,b)=>b[1]-a[1])
	return (
		<Card>
			<CardHeader
				avatar={<span className={`mdi ${icon} mdi-24px`}></span>}
				action={
					<IconButton
						onClick={handleExpandClick}
						aria-expanded={expanded}
						aria-label="show more"
					>
						<span className={`mdi ${expanded ? "mdi-chevron-up": "mdi-chevron-down"} mdi-24px`}></span>
					</IconButton>
				}
				title={<Typography variant="body2" align="left">{name}</Typography>}
			/>
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<FormGroup>
					<Grid container>
						{sorted_values.map(([label, count])=>
							<Grid item xs={12} key={label} align="left">
								<FormControlLabel
									control={<Checkbox
												checked={checked[label] || false}
												onChange={onClick}
												name={label}
												value={label}
												size="small"
											/>}
									label={<Typography variant="caption" align="left">{`${label} (${count})`}</Typography>}
									style={{margin:10}}
								/>
							</Grid>
						)}
					</Grid>	
				</FormGroup>
			</Collapse>
		</Card>
	)
}

Filter.propTypes = {
	name: PropTypes.string,
	icon: PropTypes.string,
	values: PropTypes.objectOf(PropTypes.number),
	checked: PropTypes.objectOf(PropTypes.bool),
	onClick: PropTypes.func,
	loading: PropTypes.bool,
}

export default Filter