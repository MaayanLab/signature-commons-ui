import {findMatchedSchema} from './objectMatch'
import {makeTemplate} from './makeTemplate'
import {DataResolver} from '../../connector'

export const getResourcesAndLibraries = async (schemas) => {
	const resolver = new DataResolver()
	resolver.controller()
	// Get libraries from signatures
	// We do this so we don't include libraries that don't have signatures
	const lib_counts = await resolver.aggregate(
		`/signatures/value_count`, 
		{
			fields: ["library"]
		})
	const library_entries = Object.keys(lib_counts.library)
	const {resolved_entries} = await resolver.resolve_entries({
		model: "libraries",
		entries: library_entries
	})
	const lib_id_to_name = {}
	const lib_name_to_id = {}

	const resource_id_to_name = {}
	const resource_name_to_id = {}
	const resource_to_lib = {}
	const lib_to_resource = {}

	for (const [id, lib] of Object.entries(resolved_entries)){
		const entry = await lib.serialize(true, false)
		const parent = entry["resource"]
		
		if (resource_to_lib[parent.id] === undefined) resource_to_lib[parent.id] = []
		resource_to_lib[parent.id].push(entry.id)

		lib_to_resource[entry.id] = parent.id

		const libschema = findMatchedSchema(entry, schemas)
		for (const prop of Object.values(libschema.properties)){
			if (prop.type === "title") {
				const name = makeTemplate(prop.text, entry)
				lib_id_to_name[entry.id] = name
				lib_name_to_id[name] = entry.id
			}
		}
		const resourceschema = findMatchedSchema(parent, schemas)
		for (const prop of Object.values(resourceschema.properties)){
			if (prop.type === "title") {
				const name = makeTemplate(prop.text, parent)
				resource_id_to_name[parent.id] = name
				resource_name_to_id[name] = parent.id
			}
		}
	}

	return {
		lib_id_to_name,
		lib_name_to_id,
		resource_id_to_name,
		resource_name_to_id,
		lib_to_resource,
		resource_to_lib
	}
}