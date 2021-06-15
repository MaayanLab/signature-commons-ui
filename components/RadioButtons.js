import dynamic from 'next/dynamic'
import React from 'react';
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Radio = dynamic(()=>import('@material-ui/core/Radio'));
const RadioGroup = dynamic(()=>import('@material-ui/core/RadioGroup'));
const FormControlLabel = dynamic(()=>import('@material-ui/core/FormControlLabel'));
const FormControl = dynamic(()=>import('@material-ui/core/FormControl'));
const FormLabel = dynamic(()=>import('@material-ui/core/FormLabel'));

const LabelNode = ({label, sublabel}) => {
	if (sublabel !== undefined) {
		return (
			<React.Fragment>
				<Typography variant="subtitle2" 
						style={{textTransform: "capitalize"}}					
				>{label}</Typography>
				<Typography variant="subtitle2" style={{fontSize: 11}}>{sublabel}</Typography>
			</React.Fragment>
		)
	} else {
		return <Typography variant="subtitle2"
					style={{textTransform: "capitalize"}}
				>{label}</Typography>
	}
}

export const RadioButtons = (props) => {
	const {
		value,
		values,
		handleChange,
		label,
		FormProps,
	} = props
	
	return (
		<FormControl component="fieldset">
			<FormLabel component="legend">{label}</FormLabel>
			<RadioGroup aria-label={label} name={label} value={value} onChange={handleChange}>
				{values.map(v=>(
					<FormControlLabel key={v.value} value={v.value} control={<Radio size="small"/>}
						label={<LabelNode {...v}/>}
						{...FormProps}
					/>
				))}
			</RadioGroup>
		</FormControl>
	)
}