import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

export const AutoCompleteSelection = ({label, selection, value, setValue, inputValue, setInputValue}) => {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState([]);
	const loading = open && options.length === 0 && selection !== undefined && selection !== null;

	useEffect(async () => {
		const o = Object.keys(selection||{})
		setOptions(o)
	  }, [selection]);
	

	return (
		<Autocomplete
			value={value}
			open={open}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
			}}
			onChange={(event, newValue) => {
				setValue(newValue);
			}}
			inputValue={inputValue}
			onInputChange={(event, newInputValue) => {
				setInputValue(newInputValue);
			}}
			id="sig-selector"
			options={options}
			loading={loading}
			style={{ width: 300 }}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					variant="outlined"
					InputProps={{
						...params.InputProps,
						endAdornment: (
						<React.Fragment>
							{loading ? <CircularProgress color="inherit" size={20} /> : null}
							{params.InputProps.endAdornment}
						</React.Fragment>
						),
					}}
					/>
			)}
		/>
	)
	  
// 	return(
// 		<FormControl style={{minWidth: 200}}> 
// 			<InputLabel>{label}</InputLabel>
// 			<Select
// 			labelId="select-label"
// 			id="select"
// 			value={value}
// 			onChange={setTerm}
// 			>
// 			{Object.entries(selection).map(([label, count])=>(
// 				<MenuItem value={label}>{`${label} (${count})`}</MenuItem>
// 			))}
// 			</Select>
// 		</FormControl>
		
// )
}