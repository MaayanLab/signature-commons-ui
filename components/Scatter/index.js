import { useState, useEffect } from 'react';
import PropTypes from 'prop-types'
import {process_data} from './process_data'
import {ScatterPlot} from './ScatterPlot'
import {AutoCompleteSelection} from '../AutoCompleteSelection'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import { RadioButtons } from '../RadioButtons'

const get_top_value_count = async ({resolver, library, field, inputTerm=''}) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		if (inputTerm === '') {
			const endpoint =  `/libraries/${library}/signatures/value_count`
			const filter = {
				limit: 10,
				fields: [field],
			}
			const value_count = await resolver.aggregate( endpoint, filter)
			return value_count[field]
		} else {
			const endpoint =  `/signatures/value_count`
			const filter = {
				where: {
					library,
					[field]: {
						ilike: `%${inputTerm}%`
					}
				},
				limit: 10,
				fields: [field]
			}
			const value_count = await resolver.aggregate( endpoint, filter)
			return value_count[field]
		}	
	} catch (error) {
		console.error(error)
	}

}

const filter_metadata = async ({resolver, library, term='', primary_field}) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		if (term === '') return {}
		else {
			const field = primary_field.search_field || primary_field.field
			const filter = {
				where: {
					library: library.id,
				}
			}
			if (term !== "") filter.where[field] = term
			// if (ids.length > 0) filter.where.id = {inq: ids}
			const {entries} = await resolver.filter_metadata({
				model: "signatures",
				filter,
				parent: library
			})
			return entries
		}
	} catch (error) {
		console.error(error)
	}
}

const get_results = async ({resolver, input, datatype, database, entries}) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		const query = {
			...input,
			datatype,
			database,
			input_type: input.entities !== undefined ? 'set': 'up_down',
			signatures: Object.keys(entries)
		}
		if (query.signatures.length === 0) query.limit = 100
		else query.limit = query.signatures.length
		const {set, up, down, rank} = await resolver.enrich_entities(query)
		
		if (set !== undefined) {
			const { entries: results, count } = set

			if (count>0){
				const {resolved_entries} = await resolver.resolve_entries({
					model: "signatures",
					entries: results.map(({id, direction, ...scores})=>({
						id,
						direction,
						scores
					}))
				})
				return resolved_entries
			}
		}if (rank !== undefined) {
			const { entries: results, count } = rank

			if (count>0){
				const {resolved_entries} = await resolver.resolve_entries({
					model: "signatures",
					entries: results.map(({id, direction, ...scores})=>({
						id,
						direction,
						scores
					}))
				})
				return resolved_entries
			}
		}else if (up !== undefined && down !== undefined) {
			const signatures = {}
			const { entries: up_entries, up_count } = up

			if (up_count>0){
				const {resolved_entries} = await resolver.resolve_entries({
					model: "signatures",
					entries: up_entries.map(({id, direction, ...scores})=>({
						id,
						direction,
						scores
					}))
				})
				for (const sig of Object.values(resolved_entries)){
					sig.update_entry({set: "up"})
					signatures[sig.id] = sig
				}
			}
			const { entries: down_entries, down_count } = down

			if (down_count>0){
				const {resolved_entries} = await resolver.resolve_entries({
					model: "signatures",
					entries: down_entries.map(({id, direction, ...scores})=>({
						id,
						direction,
						scores
					}))
				})
				for (const sig of Object.values(resolved_entries)){
					sig.update_entry({set: "down"})
					signatures[sig.id] = sig
				}
			}
			return signatures
		}

	} catch (error) {
		console.error(error)
	}
}

export default function SignatureScatterPlot(props) {
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
	// const database = library.dataset
	// const datatype = library.dataset_type
	// const [filter_counts, setFilterCounts] = useState({});
	// const [term, setTerm] = useState(null);
	// const [inputTerm, setInputTerm] = useState('');
	// const [category, setCategory] = useState(null);

	// useEffect( async() => {
	// 	setFilterCounts({});
	// 	if (primary_field !== undefined){
	// 		const results = await get_top_value_count({
	// 			inputTerm,
	// 			resolver,
	// 			library: library.id,
	// 			field: primary_field.field,
	// 		}) 
	// 		setFilterCounts(results);
	// 		if (term===null) setTerm('')
	// 	}
	// }, [inputTerm]);

	// const [entries, setEntries] = useState(null);
	// useEffect(async () => {
	// 	if (term !== null){
	// 		if (primary_field === undefined) setEntries({})
	// 		else {
	// 			const entries = await filter_metadata({resolver,
	// 				resolver,
	// 				library,
	// 				term,
	// 				primary_field
	// 			})
	// 			setEntries(entries)
	// 		}
	// 	}
	// }, [term]);

	// const [results, setResults] = useState(null);
	// useEffect(async () => {
	// 	if (entries !== null){
	// 		const signatures = await get_results({
	// 			resolver,
	// 			input,
	// 			datatype,
	// 			database,
	// 			entries,
	// 		})
	// 		if (signatures !==undefined){
	// 			const {scatter_data, colorize} = await process_data({
	// 				entries: signatures,
	// 				library,
	// 				schemas,
	// 				primary_color: primary_color,
	// 				secondary_color: secondary_color
	// 			})
	// 			if (category === null){
	// 				const cat = colorize.direction !== undefined ? 'direction': 'significance'
	// 				setCategory(cat)
	// 			}
	// 			setResults({scatter_data, colorize})
	// 		}
	// 	}
	// }, [entries]);
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