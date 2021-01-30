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

	resolve_entries = async ({model, entries, filter={}, parent=undefined}) => {
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
						const entry_object = new Model(model, entry, this)
						unresolved_entries[entry] = entry_object
					}
				}else {
					invalid_entries.push(entry)
				}
			} else if (typeof entry === "object"){
				if (typeof entry.id !== "undefined" && isUUID(entry.id)){
					const resolved_entry = this.data_repo[model][entry.id]
					if (typeof resolved_entry !== "undefined"){
						resolved_entries[entry.id] = resolved_entry
					} else {
						const entry_object = new Model(model, entry, this)
						if (await entry_object.validate_entry()){
							resolved_entries[entry.id] = entry_object
						}else {
							unresolved_entries[entry.id] = entry_object
						}
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
						unresolved_entries[entry.id] = entry
					}else {
						resolved_entries[entry.id] = entry
						this.data_repo[model][entry.id] = entry
					}
					
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
					resolved_entries[entry.id] = entry
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
		for (const e of entries){
			let entry = this.data_repo[model][e.id]
			if (entry === undefined){
				// If you don't have a field option, then you are resolving everything
				entry = new Model(child_model, e, this, filter.fields===undefined, parent)
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

	aggregate = async (endpoint, filter) => {
		const { response: aggregate } = await fetch_meta({
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

	enrich_entities = async ({input_type, datatype, ...query}) => {
		const start_time = new Date()
		
		const body = {
            "limit": 100,
            ...query
		}
		const endpoint = enrich_endpoint[datatype][input_type]
		const {response, contentRange } = await fetch_data({
			endpoint,
			body,
			signal: this._controller.signal,
		  })
		const signatures = response.results.map(({uuid, ...scores})=>({
			id: uuid,
			...scores
		}))

		return {
            entries: signatures,
            count: contentRange.count,
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
			const {entries, count} = await this.enrich_entities(query)
			if (entries.length>0){
				// results[uuid] = { entries, count: entries.length }
				for (const e of entries){
					signatures[e.id] = e
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
				entries: [entries[signature_id]]
			})
			const signature = resolved_entries[signature_id]
			const {id, overlap, ...scores} = entries[signature_id]
			if (signature === 'undefined') throw new Error('Invalid Signature ID')
			signature.update_entry({scores})
			// and its entities
			const {resolved_entries: entities} = await this.resolve_entries({
				model: "entities",
				entries: overlap
			})
			signature.set_children(entities)
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
				entries: Object.values(entries),
				filter: {
					where: {library: library_id}
				}
			})
			const signatures = []
			for (const sig of Object.values(resolved_entries)){
				const entry = await sig.serialize(true, false)
				if (entry.library.id === library_id){
					const {id, overlap, ...scores} = entries[signature_id]
					entry.update_entry({scores})
					signatures.push(entry)
				}
			}
			library.update_entry({signature_count: {count: signatures.length}})
			library.set_children(signatures)
			return library
		} else if(resource_id !== undefined) {
			// Resolve lib_to_resource
			if (lib_to_resource === undefined) {
				lib_to_resource = (await getLibToResource(this)).lib_to_resource
			}
			// Resolve Resource
			const {resolved_entries: resources} = await this.resolve_entries({
				model: "resource",
				entries: [resource_id]
			})
			const resource = resources[resource_id]
			// Resolve libraries
			const libids = resource_to_lib[resource_id]
			const {resolved_entries: libs} = await this.resolve_entries({
				model: "library",
				entries: libids,
				filter: {
					where: {resource: resource_id}
				}
			})			
			// resolve signatures that belong to these libraries (for sig counts)
			const {resolved_entries: signatures} = await this.resolve_entries({
				model: "signatures",
				entries: Object.values(entries),
				filter: {
					where: {library: {inq: libids}}
				}
			})

			//update counts
			const lib_counts = {}
			const resource_count = 0
			for (const sig of signatures){
				const parent_id = (await sig.parent()).id
				const grandparent_id = lib_to_resource[parent]
				if (grandparent_id === resource_id){
					if (lib_counts[parent_id] === undefined) lib_counts[parent_id] = 0
					lib_counts[parent_id] = lib_counts[parent_id] + 1
					resource_count = resource_count + 1
				}
			}
			const libraries = []
			for (const l of Object.values(libs)) {
				if (libids.indexOf(l.id)>=0){
					l.update_entry({signature_count: {count: lib_counts[l.id]}})
					libraries.push(l)
				}
			}
			resource.set_children(libraries)
			resource.update_entry({signature_count: {count: resource_count}})
			return resource
		} else {
			// top level
			// Resolve lib_to_resource
			const r = await getLibToResource(this)
			resource_to_lib = r.resource_to_lib
			lib_to_resource = r.lib_to_resource  

			// Resolve signatures last (DEF NOT FIRST)
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

			

			const resources = []
			for (const resource of Object.values(resource_dict)){
				const resource_id = resource.id
				const libraries = []
				for (const library_id of resource_to_lib[resource_id]){
					const library = libs[library_id]
					if (library!==undefined){
						library.update_entry({signature_count: {count: lib_counts[library_id]}})
						libraries.push(library)
					}
				}
				resource.set_children(libraries)
				resource.update_entry({signature_count: {count: res_counts[resource_id]}})
				resources.push(resource)
			}
			return resources
		}
	}

}