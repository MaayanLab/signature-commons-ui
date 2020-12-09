import { fetch_meta_post } from '../util/fetch/meta'
import { fetch_data } from '../util/fetch/data'
import { Model, Signature, Entity } from './model'
import isUUID from 'validator/lib/isUUID'
import { Set } from 'immutable'

const entry_model = {
	resources: Model,
	libraries: Model,
	signatures: Signature,
	entities: Entity,
}

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

export default class DataResolver {
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
		this._controller.abort()
	}

	resolve_entries = async ({model, entries, filter={}, parent=undefined}) => {
		const start_time = new Date()
		this.controller()
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
						const entry_object = new entry_model[model](model, entry, this)
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
						const entry_object = new entry_model[model](model, entry, this)
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
					entry = new entry_model[model](model, e, this, filter.fields===undefined, parent)
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
		this.controller()
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
				entry = new entry_model[model](model, e, this, filter.fields===undefined, parent)
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

	get_entities_from_signatures = async (entries) => {
		this.controller()
		const dataset_id_map = {}
        for (const entry of entries){
			await entry.entry()
			const uid = entry.id
			const parent = await entry.parent()
            const dataset_type = parent["dataset_type"]
			const dataset = parent["dataset"]
            if (dataset_id_map[dataset] === undefined){
				dataset_id_map[dataset] = {
                    endpoint: fetch_endpoint[dataset_type],
                    dataset_type: dataset_type,
                    signatures: []
                }
			}
            dataset_id_map[dataset]["signatures"].push(uid)
		}
		
		let signature_entity_map = {}
		let entities = Set()
		for (const [dataset, val] of Object.entries(dataset_id_map)) {
			const body = {
                database: dataset,
                signatures: val.signatures
			}

			const {response} = await fetch_data({
				endpoint: val.endpoint,
				body,
				signal: this._controller.signal,
			  })
		
			if (val.dataset_type === "geneset_library"){
				for (const sig of response.signatures){
					signature_entity_map[sig["uid"]] = sig["entities"]
					entities = entities.union(sig["entities"])
				}
			}else {
				entities = entities.union(response.entities)
				for (const sig of response.signatures){
					const ranks = sig.ranks
					const ranked = response.entities.map((ent, ind) => ({ ent, rank: ranks[ind] }))
					ranked.sort(({ rank: rank_a }, { rank: rank_b }) => rank_a - rank_b)
					signature_entity_map[sig.uid] = ranked.reduce((agg, { ent }) => ent !== undefined ? [...agg, ent] : agg, [])
				}
			}
			
		}
		return {
			results: signature_entity_map,
			all_entities: entities.toArray(),
		}
	}

	enrich_entities = async ({entity_type, datatype, ...query}) => {
		const start_time = new Date()
		this.controller()
		const body = {
            "limit": 10,
            ...query
		}
		const endpoint = enrich_endpoint[datatype][entity_type]
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

	get_signatures_from_entities = async ({query, repo}) => {
		const start_time = new Date()
		let entity_type
		if (query.entities !== undefined){
			entity_type = "set"
		} else if (query.up_entities !== undefined && query.down_entities !== undefined){
			entity_type = "up_down"
		} else {
			throw new Error("Invalid query: " + query)
		}
		if (repo === undefined) {
			const { response: r } = await fetch_data({ endpoint: '/listdata' })
			repo = r
		}
		let all_count = 0
		let signatures = []
		const results = {}
		for (const r of repo.repositories){
			const {uuid: database, datatype} = r
			if (entity_type === "set"){
				const q = {
                    ...query,
                    database,
                    entity_type,
                    datatype
				}
				const {entries, count:c} = await this.enrich_entities(q)
				all_count += c
                signatures = [...signatures, ...entries]
				results[database] = {"set": entries, query}
				
			}else if (entity_type === "up_down"){
				if (datatype === "rank_matrix"){
					const q = {
                        ...query,
                        database,
                        entity_type,
                        datatype,
					}
					const {entries, count:c} = await this.enrich_entities(q)
					all_count += c
					signatures = [...signatures, ...entries]
					results[database] = {rank: entries, query}
				} else {
					// Up genes
                    const up_query = {
                        limit: query.limit,
                        offset: query.offset,
                        entities: query.up_entities,
                        database: database,
                        entity_type: entity_type,
                        datatype: data_type
                    }
					const {entries: up_entries, count:up_count} = await this.enrich_entities(up_query)
					all_count += up_count
					signatures = [...signatures, ...up_entries]
					results[database] = {up: up_entries, query}

					// Down genes
                    const down_query = {
                        limit: query.limit,
                        offset: query.offset,
                        entities: query.down_entities,
                        database: database,
                        entity_type: entity_type,
                        datatype: data_type
                    }
					const {entries: down_entries, count:down_count} = await this.enrich_entities(down_query)
					all_count += down_count
					signatures = [...signatures, ...down_entries]
					results[database] = {down: down_entries, query}
				}
			}
		}

		const {resolved_entries} = await this.resolve_entries(
			{
				model: "signatures",
				entries: signatures
			}
		)
		const resolved_results = {}
		for (const [dataset_name,sigs] of Object.entries(results)){
			resolved_results[dataset_name] = []
			for (const sig of sigs["set"]){
				// resolved_results[dataset_name][key] = []
				const entry = resolved_entries[sig.id]
				if (entry!==undefined){
					const ent = await entry.entry()
					const resolved_entry_meta  = ent.meta || {}
					const unresolved_entry_meta = sig.meta || {}
					const updated_entry = {
						...ent,
						meta: {
							...unresolved_entry_meta,
							...resolved_entry_meta
						}
					}
					entry.update_entry(updated_entry)
					resolved_results[dataset_name].push(entry)
					this.data_repo["signatures"][entry.id] = entry
				}
			}
		}
		return {
			entries: resolved_results,
            count: all_count,
            duration: (new Date() - start_time) / 1000,
		}
	}

}