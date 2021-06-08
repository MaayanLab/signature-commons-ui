import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {ScatterPlot} from './ScatterPlot'
import {AutoCompleteSelection} from '../AutoCompleteSelection'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { RadioButtons } from '../RadioButtons'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';

const SignatureScatterPlot = (props) => {
	const { results,
		name_props,
		primary_field,
		set_input_term,
		input_term,
		set_category,
		category,
		set_term,
		term,
		reset,
		scatterProps,
		scatter_selection,
	} = props
	const [topTerms, setTopTerms] = useState(null)
	useEffect(() => { 
		if (topTerms === null && results !== null) {
			const terms = results.scatter_data.slice(0,5).map(i=>i.primary_value)
			setTopTerms(terms)
		}
	})
	return(
		<Grid container style={{margin: 10, minHeight:650}}>
			<Grid item xs={12} md={8} align="center">
				<ScatterPlot
					data={results || {}}
					category={category}
					scatterProps={scatterProps}
					{...name_props}
				/>
			</Grid> 
			<Grid item xs={12} md={4} align="left">
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<AutoCompleteSelection
							label={primary_field.primary_label || primary_field.label}
							selection={scatter_selection}
							value={term}
							setValue={term=>set_term(term)}
							inputValue={input_term}
							setInputValue={term => set_input_term(term)}
						/>
					</Grid>
					<Grid item xs={12}>
						<RadioButtons
							label="Color by"
							value={category}
							values={(results || {}).colorize || {}}
							handleChange={e=>set_category(e.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button onClick={reset} variant="contained">Reset Plot</Button>
					</Grid>
					<Grid item xs={12} style={{marginRight: 10}}>
						<Typography variant="h6">Top {primary_field.primary_label || primary_field.label}</Typography>
						<List>
							{(topTerms || []).map((term)=>(
								<ListItem button onClick={()=>set_term(term)}>
									<ListItemAvatar>
										<Avatar>
											<span className={`mdi mdi-24px ${primary_field.icon}`}/>
										</Avatar>
									</ListItemAvatar>
									<ListItemText
									primary={`${term}`}
									/>
								</ListItem>
							))}
						</List>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

SignatureScatterPlot.propTypes = {
	library: PropTypes.object,
	primary_color: PropTypes.string,
	secondary_color: PropTypes.string,
	meta_filter: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string,
		field: PropTypes.string,
		search_field: PropTypes.string,
		type: PropTypes.oneOf["primary", "secondary"]
	})),
	input: PropTypes.oneOf([
		PropTypes.shape({
			up_entities: PropTypes.arrayOf(PropTypes.string),
			down_entities: PropTypes.arrayOf(PropTypes.string),
		}),
		PropTypes.shape({
			entities: PropTypes.arrayOf(PropTypes.string),
		}),
	])
}

export default SignatureScatterPlot;