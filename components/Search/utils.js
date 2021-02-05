import { labelGenerator, getName } from '../../util/ui/labelGenerator'
import fileDownload from 'js-file-download'
import Color from 'color'

export const resolve_ids = ({
	query,
	model,
	lib_name_to_id,
	resource_name_to_id,
	resource_to_lib,
}) => {
	let filters = {...query.filters}
	if (filters.library){
		filters.library = filters.library.map(lib=>lib_name_to_id[lib])
	}
	if (filters.resource) {
		if (model === "signatures") {
			const {library=[], resource, ...rest} = filters
			let libraries = [...library]
			let not_exist = true
			for (const r of resource){
				const resource_id = resource_name_to_id[r]
				for (const lib of resource_to_lib[resource_id]){
					if (libraries.indexOf(lib) >= 0){
						not_exist = false
						break;
					}
					libraries.push(lib)
				}
			}
			if (not_exist){
				filters = {...rest, library: libraries}
			} else {
				filters = { ...rest, library}
			}
		} else {
			filters.resource = filters.resource.map(res=>resource_name_to_id[res])
		}
	}
	return {
		...query,
		filters
	}
}
export const get_filter = (filter_string) => {
	try {
		const filt = decodeURI(filter_string.replace("?query=", ""))
		if (filt == ""){
			return {limit:10}
		}
		return JSON.parse(filt)
	} catch (error) {
		throw new Error(error)
	}
	
}

export const get_signature_entities = async (signature_id,
	resolver,
	schemas,
	handleError=null) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		const {resolved_entries} = await resolver.resolve_entries({model: "signatures", entries: [signature_id]})
		const signature = resolved_entries[signature_id]
		if (signature === undefined){
			return null
		}
		else {
			const children = await signature.children({limit: 0})
			const input_entities = {}
			for (const c of children.entities){
				const entry = labelGenerator(c, schemas)
				input_entities[entry.info.name.text] = {
					label: entry.info.name.text,
					id: [c.id],
					type: "valid"
				}
			}
			const input = {
				entities: input_entities
			}			
			return input			
		}
	} catch (error) {
		resolver.abort_controller()
		console.error(error)
		if (handleError) handleError(error)
	}		
}

export const create_query = (input, enrichment_id=null) => {
	const query = {
		input_type: input.up_entities !== undefined ? "up_down": "set"
	}
	if (enrichment_id!==null){
		query["enrichment_id"] = enrichment_id
	} 
	for (const [field, values] of Object.entries(input)){
		query[field] = []
		for (const i of Object.values(values)){
			query[field] = [...query[field], ...i.id]
		}
	}
	return query
}

export const reset_input = (type) => {
	const input = {}
	if (type === "Overlap"){
		input.entities = {}
	} else {
		input.up_entities = {}
		input.down_entities = {}
	}
	return input
}

export const enrichment = async (query, input, resolver, handleError=null) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		const enrichment_id =  await resolver.enrichment(query, input)
		return enrichment_id
	} catch (error) {
		resolver.abort_controller()
		console.error(error)
		if (handleError) handleError(error)
	}
}

export const download_signature = async ({entry, schemas, filename}) => {
	const {entities} = await entry.children({limit: 0})
	const names = []
	for (const child of entities){
		const val = getName(child, schemas)
		if (val!==null) names.push(val)
	}
	fileDownload(names.join('\n'), filename)
}

export const get_data_for_bar_chart = ({entries, barColor, inactiveColor, order_field, order}) => {
	const color = Color(barColor)
	const data = []
	const f = entries[0].data.scores[order_field]
	const firstVal = order === 'DESC' ? f: -Math.log(f)
	for (const c of entries){
		const v = c.data.scores[order_field]
		const value = order === 'DESC' ? v: -Math.log(v)
		const col = color.darken(-((value/firstVal) - 1))
		const d = {
			name: c.info.name.text,
			value,
			color: c.data.scores['p-value'] < 0.05 ? col.hex(): inactiveColor,
			id: c.data.id,
		}	
		data.push(d)		
	}
	return data
}