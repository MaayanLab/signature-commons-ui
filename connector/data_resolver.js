import { fetch_meta_post, fetch_meta } from '../util/fetch/meta'
import { fetch_data } from '../util/fetch/data'
import { Model } from './model'
import isUUID from 'validator/lib/isUUID'
import uuid5 from 'uuid5'
import {empty_cleaner} from './build_where'
import { getLibToResource } from '../util/ui/getResourcesAndLibraries'
// const entry_model = {
// 	resources: Model,
// 	libraries: Model,
// 	signatures: Signature,
// 	entities: Entity,
// }

const fetch_endpoint = {
    geneset_library: "/fetch/set",
    rank_matrix: "/fetch/rank"
}

const enrich_endpoint = {
    geneset_library: {
        set: "/enrich/overlap",
        up_down: "/enrich/overlap"
    },
    rank_matrix: {
        up_down: "/enrich/ranktwosided",
        set: "/enrich/rank"
    }
}

export class DataResolver {
	constructor(){
		this.data_repo = {
			resources: {},
			libraries: {},
			signatures: {},
			entities: {},
			enrichment: {},
		}
		this._controller = null
	}

	controller = () => {
		this._controller = new AbortController()
		return this._controller
	}

	abort_controller = () => {
		if (this._controller) this._controller.abort()
	}

	resolve_entries = async ({model, entries=[], filter={}, parent=undefined}) => {
		const start_time = new Date()
		const resolved_entries = {}
        const unresolved_entries = {}
		const invalid_entries = []
		for (const entry of entries) {
			if (typeof entry === "string"){
				if (isUUID(entry)){
					const resolved_entry = this.data_repo[model][entry]
					if (typeof resolved_entry !== "undefined"){
						resolved_entries[entry] = resolved_entry
					}else {
						unresolved_entries[entry] = {id: entry}
					}
				}else {
					invalid_entries.push(entry)
				}
			} else if (entry instanceof Model){
				const resolved_entry = this.data_repo[model][entry.id]
				if (typeof resolved_entry !== "undefined"){
					resolved_entries[entry.id] = resolved_entry
				} else {
					await entry.validate_entry()
					if (!entry.resolved){
						unresolved_entries[entry.id] = entry.get_raw_entry()
					}else {
						resolved_entries[entry.id] = entry
						this.data_repo[model][entry.id] = entry
					}
					
				}
			} else if (typeof entry === "object"){
				if (typeof entry.id !== "undefined" && isUUID(entry.id)){
					const resolved_entry = this.data_repo[model][entry.id]
					if (typeof resolved_entry !== "undefined"){
						resolved_entry.update_entry(entry)
						resolved_entries[entry.id] = resolved_entry
					} else {
						const entry_object = new Model(model, entry, this)
						if (await entry_object.validate_entry()){
							resolved_entries[entry.id] = entry_object
						}else {
							unresolved_entries[entry.id] = entry_object.get_raw_entry()
						}
					}
				}else {
					invalid_entries.push(entry)
				}
			} 
		}
		if (Object.keys(unresolved_entries).length > 0){
			filter = {
				...filter,
				where: {
					and: [
						filter.where,
						{
							id: {
								inq: Object.keys(unresolved_entries)
							}
						}
					]
				}
			}
			filter = empty_cleaner(filter) || {}
			const { response: entries } = await fetch_meta_post({
				endpoint: `/${model}/find`,
				body: {
				  filter,
				},
				signal: this._controller.signal,
			  })
			for (const e of entries){
				let entry = this.data_repo[model][e.id]
				if (entry === undefined){
					// If you don't have a field option, then you are resolving everything
					entry = new Model(model, e, this, filter.fields===undefined, parent)
					const unresolved = unresolved_entries[e.id]
					entry.update_entry(unresolved)
					// resolved_entries[entry.id] = entry
				} else {
					entry.update_entry(e)
				}
				
				this.data_repo[model][entry.id] = entry
				resolved_entries[entry.id] = entry
			}
		}
		return { 
			resolved_entries: resolved_entries, 
			invalid_entries: invalid_entries,
			count: Object.keys(resolved_entries).length,
			duration: (new Date() - start_time) / 1000
		}
	}

	filter_metadata = async ({model, filter={}, parent}) => {
		const start_time = new Date()		
		const resolved_entries = {}
		filter = empty_cleaner(filter) || {}
		const { response: entries, contentRange, duration } = await fetch_meta_post({
			endpoint: `/${model}/find`,
			body: {
			  filter,
			},
			signal: this._controller.signal,
		  })
		for (const e of entries){
			let entry = this.data_repo[model][e.id]
			if (entry === undefined){
				// If you don't have a field option, then you are resolving everything
				entry = new Model(model, e, this, filter.fields===undefined, parent)
				resolved_entries[entry.id] = entry
			} else {
				entry.update_entry(e)
			}
			
			this.data_repo[model][entry.id] = entry
			resolved_entries[entry.id] = entry
		}
		return {
			entries: resolved_entries,
			count: contentRange.count,
			duration: (new Date() - start_time) / 1000
		}
	}

	filter_through = async ({model, entry, filter}) => {
		const start_time = new Date()		
		const resolved_entries = {}
		if (!entry instanceof Model) {
			entry = Model(model, entry, this)
			await entry.resolve()
		}
		const child_model = entry.child_model
		const { response: entries, contentRange, duration } = await fetch_meta({
			endpoint: `/${model}/${entry.id}/${child_model}`,
			body: {
			  filter,
			},
			signal: this._controller.signal,
		  })
		for (const e of entries || []){
			let entry = this.data_repo[model][e.id]
			if (entry === undefined){
				// If you don't have a field option, then you are resolving everything
				entry = new Model(child_model, e, this, filter.fields===undefined, parent)
				resolved_entries[entry.id] = entry
			} else {
				entry.update_entry(e)
			}
			
			this.data_repo[child_model][entry.id] = entry
			resolved_entries[entry.id] = entry
		}
		return {
			entries: resolved_entries,
			count: contentRange.count,
			duration: (new Date() - start_time) / 1000
		}
	}

	aggregate = async (endpoint, filter) => {
		filter = empty_cleaner(filter) || {}
		const { response: aggregate } = await fetch_meta({
			endpoint,
			body: {
			  filter,
			},
			signal: this._controller.signal,
		  })
		return aggregate
	}

	aggregate_post = async ({endpoint, filter}) => {
		const { response: aggregate } = await fetch_meta_post({
			endpoint,
			body: {
			  filter,
			},
			signal: this._controller.signal,
		  })
		return aggregate
	}

	// Data API

	get_enrichment = (enrichment_id) => {
		return this.data_repo.enrichment[enrichment_id]
	}

	enrich_set_input_to_set = async ({input_type, datatype, ...query}) => {		
		const body = {
            "limit": 100,
            ...query
		}
		const endpoint = enrich_endpoint.geneset_library.set
		const {response, contentRange } = await fetch_data({
			endpoint,
			body,
			signal: this._controller.signal,
		  })
		const signatures = response.results.map(({uuid, overlap, setsize, ...scores})=>{
			return({
			id: uuid,
			overlap,
			setsize,
			"overlap size": (overlap || []).length,
			"p-value": scores["p-value"],
			"q-value (BH)": scores.fdr,
			"q-value (Bonferroni)": scores["p-value-bonferroni"],
			"odds ratio": scores.oddsratio,
		})})

		return {
            set: {
				entries: signatures,
				count: contentRange.count
			}
        }

	}

	enrich_set_input_to_set_rank = async ({input_type, datatype, ...query}) => {
		
		const body = {
            "limit": 100,
            ...query
		}
		const endpoint = enrich_endpoint.rank_matrix.set
		const {response, contentRange } = await fetch_data({
			endpoint,
			body,
			signal: this._controller.signal,
		  })
		const signatures = response.results.map(({uuid, direction, ...scores})=>{
			return({
			id: uuid,
			direction: direction===1?"up": "down",
			"p-value": scores["p-value"],
			"q-value (BH)": scores.fdr,
			"q-value (Bonferroni)": scores["p-value-bonferroni"],
			"zscore": scores.zscore,
		})})

		return {
            set: {
				entries: signatures,
				count: (contentRange||{}).count
			}
        }

	}

	enrich_two_sided_input_to_rank = async ({input_type, datatype, ...query}) => {
		const body = {
            "limit": 100,
            ...query
		}
		const endpoint = enrich_endpoint.rank_matrix.up_down
		const {response, contentRange } = await fetch_data({
			endpoint,
			body,
			signal: this._controller.signal,
		  })
		const signatures = response.results.map(({uuid, ...scores})=>{
			let direction = "ambiguous"
			if (scores['direction-up'] === -1 && scores['direction-down'] === 1) direction = "reversers"
			if (scores['direction-up'] === 1 && scores['direction-down'] === -1) direction = "mimickers"
			return({
				id: uuid,
				direction,
				"log p (avg)": scores["logp-avg"],
				"log p (Fisher)": scores["logp-fisher"],
				"FDR (down)": scores["fdr-down"],
				"FDR (up)": scores["fdr-up"],
				"p-value (down)": scores["p-down"],
				"p-value (up)": scores["p-up"],
				"z-score (down)": scores["z-down"],
				"z-score (up)": scores["z-up"],
				"p-value Bonferroni (up)": scores["p-up-bonferroni"],
				"p-value Bonferroni (down)": scores["p-down-bonferroni"],
			})})

		return {
            rank: {
				entries: signatures,
				count: contentRange.count
			}
        }
		
	}

	enrich_two_sided_input_to_set = async ({
		up_entities,
		down_entities,
		...query}) => {
		const up_query = {
			entities: up_entities,
			...query
		}
		const {entries: up_entries, count: up_count } = await this.enrich_set_input_to_set(up_query)
		
		const down_query = {
			entities: down_entities,
			...query
		}
		const {entries: down_entries, count: down_count } = await this.enrich_set_input_to_set(down_query)
		return {
			up: {
				entries: up_entries,
				count: up_count,
			},
			down: {
				entries: down_entries,
				count: down_count,
			}
        }
	}

	enrich_entities = async (query) => {
		const start_time = new Date()
		const {input_type, datatype} = query

		const enricher = {
			set: {
				geneset_library: this.enrich_set_input_to_set,
				rank_matrix: this.enrich_set_input_to_set_rank,
			},
			up_down: {
				geneset_library: this.enrich_two_sided_input_to_set,
				rank_matrix: this.enrich_two_sided_input_to_rank,
			}
		}
		const response = await enricher[input_type][datatype](query)

		return {
            ...response,
            duration: (new Date() - start_time) / 1000,
            database: query.database
        }
	}

	enrichment = async (query, input) => {
		const enrichment_id = query.enrichment_id || uuid5(JSON.stringify(query))
		const { response } = await fetch_data({
			endpoint: "/listdata",
			signal: this._controller.signal,
		  })
		let signatures = {}
		for (const {datatype, uuid} of response.repositories){
			query.database = uuid
			query.datatype = datatype
			const {set, up, down, rank} = await this.enrich_entities(query)
			if (set !== undefined) {
				const { entries, count } = set
				if (count>0){
					for (const e of entries){
						signatures[e.id] = e
					}
				}
			}if (rank !== undefined) {
				const { entries, count } = rank
				if (count>0){
					for (const e of entries){
						signatures[e.id] = e
					}
				}
			}else if (up !== undefined && down !== undefined) {
				const { entries: up_entries, count: up_count } = up
				if (up_count>0){
					for (const e of up_entries){
						signatures[e.id] = {
							...e,
							set: "up",
						}
					}
				}
				const { entries: down_entries, count: down_count } = down
				if (down_count>0){
					for (const e of down_entries){
						signatures[e.id] = {
							...e,
							set: "down",
						}
					}
				}
			}
		}
		this.data_repo.enrichment[enrichment_id] = {
			entries: signatures,
			input,
		}
		return enrichment_id
	}

	// lazy-ish resolution
	resolve_enrichment = async ({
		enrichment_id,
		resource_id,
		library_id,
		signature_id,
		lib_to_resource,
		resource_to_lib,
	}) => {
		// Get enrichment
		const enrichment = this.data_repo.enrichment[enrichment_id]
		if (enrichment === undefined) throw new Error("No Enrichment Found")

		const {entries} = enrichment
		// Process enrichment on a sig/lib/resource level
		if (signature_id !== undefined){
			// Resolve signature
			const {resolved_entries} = await this.resolve_entries({
				model: "signatures",
				entries: [entries[signature_id].id]
			})
			const signature = resolved_entries[signature_id]
			const {id, overlap, set, direction, ...scores} = entries[signature_id]
			if (signature === 'undefined') throw new Error('Invalid Signature ID')
			if (set!==undefined) signature.update_entry({scores, direction, set})
			else signature.update_entry({direction, scores})
			// and its entities
			let entities = {}
			if (overlap!==undefined){
				const {resolved_entries} = await this.resolve_entries({
					model: "entities",
					entries: overlap
				})
				entities = resolved_entries
			}
			await signature.set_children(Object.values(entities))
			return signature
		}else if (library_id !== undefined){
			// Resolve library
			const {resolved_entries: libraries} = await this.resolve_entries({
				model: "libraries",
				entries: [library_id]
			})
			const library = libraries[library_id]
			// And its signatures
			const {resolved_entries} = await this.resolve_entries({
				model: "signatures",
				entries: Object.keys(entries),
				filter: {
					where: {library: library_id}
				}
			})
			const signatures = []
			for (const sig of Object.values(resolved_entries)){
				const entry = await sig.serialize(true, false)
				const libid = entry.library.id
				if (libid === library_id){
					const {id, overlap, set, direction, ...scores} = entries[entry.id]
					if (set!==undefined) sig.update_entry({scores, direction, set})
					else sig.update_entry({scores, direction})
					await sig.set_children(overlap)
					signatures.push(sig)
				}
			}
			library.update_entry({scores: {signature_count: signatures.length}})
			await library.set_children(signatures)
			return library
		} else if(resource_id !== undefined) {
			// Resolve lib_to_resource
			if (lib_to_resource === undefined) {
				lib_to_resource = (await getLibToResource(this)).lib_to_resource
			}
			// Resolve Resource
			const {resolved_entries: resources} = await this.resolve_entries({
				model: "resources",
				entries: [resource_id]
			})
			const resource = resources[resource_id]
			// Resolve libraries
			const libids = resource_to_lib[resource_id]
			const {resolved_entries: libs} = await this.resolve_entries({
				model: "libraries",
				entries: libids,
				filter: {
					where: {resource: resource_id}
				}
			})			
			// resolve signatures that belong to these libraries (for sig counts)
			const {resolved_entries: signatures} = await this.resolve_entries({
				model: "signatures",
				entries: Object.keys(entries),
				filter: {
					where: {library: {inq: libids}}
				}
			})

			//update counts
			const lib_counts = {}
			let resource_count = 0
			for (const sig of Object.values(signatures)){
				const parent_id = (await sig.parent()).id
				const grandparent_id = lib_to_resource[parent_id]
				if (grandparent_id === resource_id){
					if (lib_counts[parent_id] === undefined) lib_counts[parent_id] = 0
					lib_counts[parent_id] = lib_counts[parent_id] + 1
					resource_count = resource_count + 1
				}
			}
			const libraries = []
			for (const l of Object.values(libs)) {
				if (libids.indexOf(l.id)>=0 && lib_counts[l.id]!==undefined){
					l.update_entry({scores: {signature_count: lib_counts[l.id]}})
					libraries.push(l)
				}
			}
			await resource.set_children(libraries)
			resource.update_entry({scores: {signature_count: resource_count}})
			return resource
		} 
	}

	resolve_all_enrichment = async ({
		enrichment_id,
		lib_to_resource,
		resource_to_lib,
	}) => {
		// Get enrichment
		const enrichment = this.data_repo.enrichment[enrichment_id]
		if (enrichment === undefined) throw new Error("No Enrichment Found")
		const {entries} = enrichment

		// Resolve lib_to_resource
		const r = await getLibToResource(this)
		// resource_to_lib = r.resource_to_lib
		// lib_to_resource = r.lib_to_resource  
		
		// Resolve signatures
		const {resolved_entries: signatures} = await this.resolve_entries({
			model: "signatures",
			entries: Object.keys(entries)
		})
		// Get libraries and resources and their counts
		const lib_counts = {}
		const res_counts = {}
		for (const sig of Object.values(signatures)){
			const libid = (await sig.parent()).id
			const resid = lib_to_resource[libid]
			if (lib_counts[libid] === undefined) lib_counts[libid] = 0
			if (res_counts[resid] === undefined) res_counts[resid] = 0
			lib_counts[libid] = lib_counts[libid] + 1
			res_counts[resid] = res_counts[resid] + 1
			const {id, overlap, direction, ...scores} = entries[sig.id]
			sig.update_entry({direction, scores})
			sig.set_children(overlap)
		}

		// resolve resources
		const {resolved_entries: resource_dict} = await this.resolve_entries({
			model: "resources",
			entries: Object.keys(res_counts)
		})
		// resolve libraries
		const {resolved_entries: libs} = await this.resolve_entries({
			model: "libraries",
			entries: Object.keys(lib_counts)
		})

		const resources = {}
		for (const resource of Object.values(resource_dict)){
			const resource_id = resource.id
			const libraries = []
			for (const library_id of resource_to_lib[resource_id]){
				const library = libs[library_id]
				if (library!==undefined){
					library.update_entry({scores: {signature_count: lib_counts[library_id]}})
					libraries.push(library)
				}
			}
			await resource.set_children(libraries)
			resource.update_entry({scores: {signature_count: res_counts[resource_id]}})
			resources[resource.id] = resource
		}
		return {
			resources,
			signatures
		}
		
	}

}