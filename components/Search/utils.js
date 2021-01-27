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
