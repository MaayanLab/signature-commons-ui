import React, { useState } from 'react';
import dynamic from 'next/dynamic'
import { makeStyles } from '@material-ui/core/styles';

const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const TextField = dynamic(()=>import('@material-ui/core/TextField'))
const Autocomplete = dynamic(()=>import('@material-ui/lab/Autocomplete'))

const useStyles = makeStyles((theme) => ({
	input: {
		fontSize: 12,
		height: 40,
		width: 230,
		marginLeft: 10,
	},
	textfield: {
		width: 230,
		background: "#f7f7f7",
		borderRadius: 15,
	}
  }));

export const AutoCompleteSelection = ({label, selection, value, setValue, inputValue, setInputValue}) => {
	const [open, setOpen] = useState(false);
	const classes = useStyles()
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
			options={selection}
			style={{ width: 250 }}
			ListboxProps={{
				style: {fontSize: 12}
			}}
			noOptionsText={<Typography variant="caption">No results</Typography>}
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={label}
					size="small"
					placeholder={`Search for ${label.toLowerCase()}`}
					className={classes.textfield}
					InputLabelProps={{
						shrink: true,
					}}
					InputProps={{
						...params.InputProps,
						disableUnderline: true,
						classes: {
							input: classes.input,
							style: {
								fontSize: 12,
								height: 40,
								width: 230,
								marginLeft: 10,
							}
							// notchedOutline: textFieldStyles.notchedOutline
						},
						endAdornment: null,
					}}
					style={{
						width: 230,
						background: "#f7f7f7",
						borderRadius: 15,
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