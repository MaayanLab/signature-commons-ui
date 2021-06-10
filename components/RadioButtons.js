import dynamic from 'next/dynamic'
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Radio = dynamic(()=>import('@material-ui/core/Radio'));
const RadioGroup = dynamic(()=>import('@material-ui/core/RadioGroup'));
const FormControlLabel = dynamic(()=>import('@material-ui/core/FormControlLabel'));
const FormControl = dynamic(()=>import('@material-ui/core/FormControl'));
const FormLabel = dynamic(()=>import('@material-ui/core/FormLabel'));

export const RadioButtons = (props) => {
	const {
		value,
		values,
		handleChange,
		label
	} = props

	return (
		<FormControl component="fieldset">
			<FormLabel component="legend">{label}</FormLabel>
			<RadioGroup aria-label={label} name={label} value={value} onChange={handleChange}>
				{Object.keys(values).map(v=>(
					<FormControlLabel key={v} value={v} control={<Radio size="small"/>}
						label={<Typography variant="subtitle2">{v}</Typography>}
						style={{textTransform: "none"}} />
				))}
			</RadioGroup>
		</FormControl>
	)
}