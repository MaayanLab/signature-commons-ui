import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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
					<FormControlLabel key={v} value={v} control={<Radio />} label={v} style={{textTransform: "capitalize"}} />
				))}
			</RadioGroup>
		</FormControl>
	)
}