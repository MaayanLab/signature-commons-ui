import PropTypes from 'prop-types'
import {ScatterPlot} from './ScatterPlot'
import {AutoCompleteSelection} from '../AutoCompleteSelection'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import { RadioButtons } from '../RadioButtons'

const SignatureScatterPlot = (props) => {
	const { results,
		name_props,
		primary_field,
		set_input_term,
		input_term,
		scatter_value_count,
		set_category,
		category,
		set_term,
		term,
	} = props
	if (results === null || scatter_value_count === null) return ( 
		<Grid container style={{height:650, width: "100%"}}>
			<Grid item xs={12} align="center" style={{margin: 100}}>
				<CircularProgress />
			</Grid>
		</Grid>
	)
	else return(
		<Grid container style={{margin: 10, height:650}}>
			<Grid item xs={12} md={8} align="center">
				<ScatterPlot
					data={results}
					category={category}
					{...name_props}
				/>
			</Grid> 
			<Grid item xs={12} md={4} align="left">
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<RadioButtons
							label="Color by"
							value={category}
							values={results.colorize}
							handleChange={e=>set_category(e.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						<AutoCompleteSelection
							label={primary_field.label}
							selection={scatter_value_count}
							value={term}
							setValue={term=>set_term(term)}
							inputValue={input_term}
							setInputValue={term => set_input_term(term)}
						/>
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