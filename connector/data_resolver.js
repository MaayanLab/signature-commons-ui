import { fetch_meta_post, fetch_meta } from '../util/fetch/meta'
import { fetch_data } from '../util/fetch/data'
import { Model } from './model'
import isUUID from 'validator/lib/isUUID'
import { Set } from 'immutable'
import {empty_cleaner} from './build_where'

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
			entities: {}
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

	filter_metadata = async ({model, filter, parent}) => {
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
	
	enrich_entities = async ({input_type, datatype, ...query}) => {
		const start_time = new Date()
		
		const body = {
            "limit": 10,
            ...query
		}
		const endpoint = enrich_endpoint[datatype][input_type]
		const {response, contentRange } = await fetch_data({
			endpoint,
			body,
			signal: this._controller.signal,
		  })
		const signatures = response.results.map(({uuid, ...meta})=>({
			id: uuid,
			meta
		}))

		return {
            entries: signatures,
            count: contentRange.count,
            duration: (new Date() - start_time) / 1000,
            database: query.database
        }
	}

}