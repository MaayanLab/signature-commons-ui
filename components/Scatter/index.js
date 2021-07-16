import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'

const ScatterPlot = dynamic(async () => (await import('./ScatterPlot')).ScatterPlot);
const AutoCompleteSelection = dynamic(async () => (await import('../AutoCompleteSelection')).AutoCompleteSelection);
const RadioButtons = dynamic(async () => (await import('../RadioButtons')).RadioButtons);

const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const Button = dynamic(()=>import('@material-ui/core/Button'))
const List = dynamic(()=>import('@material-ui/core/List'))
const ListItem = dynamic(()=>import('@material-ui/core/ListItem'))
const ListItemText = dynamic(()=>import('@material-ui/core/ListItemText'))
const ListItemAvatar = dynamic(()=>import('@material-ui/core/ListItemAvatar'))
const Avatar = dynamic(()=>import('@material-ui/core/Avatar'))


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
			const terms = []
			for (const i of results.scatter_data) {
				if (terms.length === 5) break
				else {
					if (terms.indexOf(i.primary_value) === -1) terms.push(i.primary_value)
				}
			}
			setTopTerms(terms)
		}
	})

	const values = Object.keys((results || {}).colorize || {}).map(label=>({label, value: label}))
	return(
		<Grid container style={{margin: 10, minHeight:550}}>
			<Grid item xs={12} md={8} align="center">
				<ScatterPlot
					data={results || {}}
					category={category}
					scatterProps={scatterProps}
					{...name_props}
				/>
			</Grid> 
			<Grid item xs={12} md={4} align="left">
				<Grid container spacing={1}>
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
							label={<Typography variant="body1">Color by</Typography>}
							value={category}
							values={values}
							handleChange={e=>set_category(e.target.value)}
						/>
					</Grid>
					<Grid item xs={12} style={{marginRight: 10}}>
						<Typography variant="body1">Top {primary_field.primary_label || primary_field.label}</Typography>
						<List dense style={{marginLeft: -25}}>
							{(topTerms || []).map((term)=>(
								<ListItem button onClick={()=>set_term(term)}>
									<ListItemAvatar>
										<Avatar
											style={{width: 27, height:27}}
										>
											<span className={`mdi mdi-18px ${primary_field.icon}`}/>
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										style={{marginLeft: -18}}
										primary={<Typography variant="subtitle2">{term}</Typography>}
									/>
								</ListItem>
							))}
						</List>
					</Grid>
					<Grid item xs={12}>
						<Button onClick={reset}
							variant="contained"
							style={{textTransform: "none", marginLeft: 25, height: 50}}
							color="default"
						>
							Reset Plot
						</Button>
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