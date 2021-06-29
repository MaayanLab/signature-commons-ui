
import { fetch_external_post } from '../../util/fetch/fetch_external'
import fetch from 'isomorphic-unfetch'
import { getName } from '../../util/ui/labelGenerator'

const base_url = "https://maayanlab.cloud/matrixapi"

export const get_gene_names = async () => {
	const url = "https://maayanlab.cloud/archs4/data/gene_human_tsne.csv"
	const file = await (await fetch(url)).text()
	const genes = []
	for (const row of file.split("\n").slice(1)){
		genes.push(row.split(",").slice(-1)[0])
	}
	return genes
}

export const get_coexpressed_genes = async ({gene, type}) => {
	let up_entities
	let down_entities
	const col_promises = []
	if (type !== "down"){
		const coltop = fetch_external_post({
			url: base_url + "/coltop",
			body: {
				count: 101,
				id: gene.toUpperCase(),
			},
			headers: {
				'Accept': 'application/json',
			}
		})
		col_promises.push(coltop)
	}
	if (type !== "up"){
		const colbottom = fetch_external_post({
			url: base_url + "/colbottom",
			body: {
				count: 100,
				id: gene.toUpperCase(),
			},
			headers: {
				'Accept': 'application/json',
			}
		})
		col_promises.push(colbottom)
	}
	const resolved = await Promise.all(col_promises)
	if (type !== "down"){
		if (type === "up"){
			up_entities = resolved[0].response.rowids.slice(1)
			return {entities: up_entities}
		} else {
			up_entities = resolved[0].response.rowids.slice(1)
		}
	}
	if (type !== "up"){
		if (type === "down"){
			down_entities = resolved[0].response.rowids.slice(1)
			return {entities: down_entities}
		} else {
			down_entities = resolved[1].response.rowids.slice(1)
		}
	}
	return {
		up_entities,
		down_entities,
	}
}

const getNames = (schemas) => {
	const entity_schemas = schemas.filter(s=>s.type==="entity")
	const names = []
	// const fields = []
	for (const schema of entity_schemas){
		for (const prop of Object.values(schema.properties)){
			if (prop.type==="title" && names.indexOf(prop.field) === -1) names.push(prop)
			else if (prop.type==="alternative" && names.indexOf(prop.field) === -1) names.push(prop)
		}
	}
	return names
}

const fetch_names = async ({schemas, entities, resolver}) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		const filter = {}
		const names = getNames(schemas)
		if (names.length === 0) return {}
		else if (names.length > 1) {
			const or = []
		for (const name of names){
			or.push({[name.field]:{
				inq: entities
			}})
		}
			filter.where = {or}
		} else {
			filter.where = {
				[names[0].field]: {
					inq: entities
				}
			}
		}
		const {entries: results} = await resolver.filter_metadata({
			model: "entities",
			filter,
		})
		const resolved_entities = {}
		const ids = []
		for (const [id, e] of Object.entries(results)){
			ids.push(id)
			const entry = await e.entry()
			const name = getName(entry, schemas)
			resolved_entities[name] = {
				id: [id],
				label: name,
				type: "valid"
			}
		}

		return {resolved_entities, ids }	
	} catch (error) {
		console.error(error)
	}
}

export const resolve_genes = async ({coexpressed_genes, schemas, resolver}) => {
	const input = {}
	const query = {input_type: "up_down"}
	const promises = []
	for (const [field, entities] of Object.entries(coexpressed_genes)) {
		 const {resolved_entities, ids } = await fetch_names({schemas, entities, resolver})
		 input[field] = resolved_entities
		 query[field] = ids
	}
	return {input, query}
}

export const get_gene_id = async ({gene, schemas, resolver}) => {
	const { ids } = await fetch_names({schemas, entities: [gene], resolver})
	return (ids || [])[0]
}

export const enrichment = async ({resolver, input, query}) => {
	try {
		resolver.abort_controller()
		resolver.controller()
		const enrichment_id =  await resolver.enrichment(query, input)
		return enrichment_id
	} catch (error) {
		resolver.abort_controller()
		console.error(error)
	}
}

export const enrich_gene_coexpression = async ({resolver, schemas, gene, type}) => {
	const coexpressed_genes = await get_coexpressed_genes({gene, type})
	const {input, query} = await resolve_genes({coexpressed_genes, schemas, resolver})
	const enrichment_id = await enrichment({resolver, input, query})
	return enrichment_id
}