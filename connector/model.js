import isUUID from 'validator/lib/isUUID'
import merge from 'deepmerge'
import FlexSearch from 'flexsearch'
import { findMatchedSchema } from '../util/ui/objectMatch'
import { makeTemplate } from '../util/ui/makeTemplate'


const validate = require('@dcic/signature-commons-schema').validate.bind({})

const singular_form = {
    resources: "resource",
    libraries: "library",
    signatures: "signature",
    entities: "entity"
}

export const parent_mapper = {
    resources: null,
    libraries: "resources",
    signatures: "libraries",
    entities: null
}

const child_mapper = {
    resources: "libraries",
    libraries: "signatures",
    signatures: "entities",
    entities: "signatures"
}

export class Model {
	constructor(model, entry, data_resolver=null, resolved=false, parent=undefined){
		if (data_resolver===null){
			throw new Error(`${model} should be instantiated in a data repository`)
		}
		this._data_resolver = data_resolver
		this.resolved = resolved
		if (parent_mapper[model] !== null){
			if (parent instanceof Model) this._parent = parent
		}else {
			this._parent = null
		}
		this._children = undefined
        this.children_count = undefined
        this.model = model
        this.parent_model = parent_mapper[model]
		this.child_model = child_mapper[model]
		if (typeof entry === "string" && isUUID(entry)){
			this._entry = {"id": entry}
            this.resolved = false 
		}else if (!(entry instanceof Array) && typeof entry === "object"){
			if (entry.id === undefined || !isUUID(entry.id)){
				throw new Error(`Invalid parent model`)
			}
			this._entry = entry
			// if (!this.resolved){
			// 	this.validate_entry()
			// }
		}
		this.id = this._entry.id
	}

	validate_entry = async () => {
		// If the entry is valid then it have all the necessary fields
		// as defined by the core validator, hence it is resolved
		if (this.resolved) return this.resolved
		if (this._entry.validator === undefined){
			this.resolved = false
		} else {
			try {
				await validate(this._entry)
				this.resolved = true
			} catch (error) {
				console.error(error)
				this.resolved = false
			}
		}
		return this.resolved
	}

	resolve_entry = async () => {
		await this.validate_entry()
		if (!this.resolved){
			const {resolved_entries, invalid_entries} = await this._data_resolver.resolve_entries(
				{
					model: this.model,
					entries: [this._entry]
				}
			)
			if (resolved_entries[this.id]!==undefined){
				this._entry = await resolved_entries[this.id].entry()
				this.resolved = true
				this._data_resolver.data_repo[this.model][this.id] = this
			} else {
				throw new Error(`Cannot resolve ${singular_form[this.model]} with id ${this._entry.id}`)
			}
		}
	}

	resolve_parent = async () => {
		if (!this.resolved) await this.resolve_entry()
		if (this.parent_model === null) {
			this._parent = null
		}else {
			if (this._parent === undefined){
				const parent_model = singular_form[this.parent_model]
				this._parent = new Model(this.parent_model, this._entry[parent_model], this._data_resolver)
			}
			await this._parent.resolve_entry()
		}
	}

	resolve_children = async (filter) => {
		const {limit, ...rest} = filter
		if (limit === undefined){ 
			filter = {
				limit: 10,
				...rest
			}
		}else if (filter.limit === 0) {
			filter = rest
		}
		
		const { entries, count} = await this._data_resolver.filter_through({
			model: this.model,
			entry: this,
			filter: filter,
		})
		this._children = entries
		this.children_count = count
	}

	entry = async () => {
		if (!this.resolved) await this.resolve_entry()
		return this._entry
	}

	parent = async () => {
		if (this._parent === null) return null
		if (this._parent === undefined || !this._parent.resolved) await this.resolve_parent()
		return await this._parent.entry()
	}

	parent_object = async () => {
		if (this._parent === null) return null
		if (this._parent === undefined || !this._parent.resolved){
			await this.resolve_parent()
		}
		return this._parent
	}

	children = async (filter={}, field=null, order_type="DESC") => {
		if (this._preset_children!==null && this._preset_children!==undefined){
			const {limit=10, skip=0, order,...rest} = filter
			if (Object.keys(rest).length===0){
				let children = []
				for (const c of this._preset_children){
					const child = await c.entry()
					child[singular_form[c.parent_model]] = await c.parent()
					children.push(child)
				}
				if (field) children = this.sort_children_by_score(children, field, order_type)
				return {
					count: {
						[this.child_model]: this._preset_children.length,
					},
					[this.child_model]: limit===0? children: children.slice(skip, skip+limit),
					ids: this._preset_children.map(c=>c.id)
				}
			} else {
				let results = await this.search_children(filter)
				let children = []
				for (const c of Object.values(results)){
					const child = await c.entry()
					child[singular_form[c.parent_model]] = await c.parent()
					children.push(child)
				}
				if (field) children = this.sort_children_by_score(children, field, order_type)
				return {
					count: {
						[this.child_model]: results.length,
					},
					[this.child_model]: limit===0? children: children.slice(skip, skip+limit),
				}
			}
		}else{
			if (this._children === undefined || Object.keys(filter).length > 0) await this.resolve_children(filter)
			let children = []
			for (const c of Object.values(this._children)){
				const child = await c.entry()
				child[singular_form[c.parent_model]] = await c.parent()
				children.push(child)
			}
			if (field) children = this.sort_children_by_score(children, field, order_type)
			return {
				count: {
					[this.child_model]: this.children_count,
				},
				[this.child_model]: children
			}
		}
	}

	sort_children_by_score = (children, field, order="DESC") => {
		let sorted_children
		if (order === "DESC"){
			sorted_children = children.sort((a,b)=>b.scores[field]-a.scores[field])
		}else {
			sorted_children = children.sort((a,b)=>a.scores[field]-b.scores[field])
		}
		return children
	}

	set_children = async (entries) => {
		const {resolved_entries} = await this._data_resolver.resolve_entries({
			model:this.child_model,
			entries}
		)
		const children = []
		for (const entry of entries){
			const entry_id = typeof entry === 'object' ? entry.id: entry
			const resolved_entry = resolved_entries[entry_id]
			if (resolved_entry){
				if (typeof entry === 'object') resolved_entry.update_entry(await entry.entry())
				children.push(resolved_entry)
			}
		}
		this._preset_children = children
		this.children_count = this._preset_children.length
	}

	get_children_ids = async () => {
		if (this._preset_children!==undefined) return this._preset_children.map(c=>c.id)
		if (this._children === undefined) await this.children()
		return Object.keys(this._children)
		
	}

	create_search_index = async (schema=null, grandchild=false) => {
		// If grandchild is true, then it will serialize the grandchild
		const docs = []
		for (const child of this._preset_children){
			const e = await child.serialize(true, grandchild)
			const entry = {
				id: e.id,
				meta: JSON.stringify(e),
			}
			if (schema!==null){
				for (const prop of Object.values(schema.properties)){
					if (prop.type === 'filter'){
						const field = prop.search_field || prop.field
						const templateString = '${'+field+'}'
						entry[field] = makeTemplate(templateString, e)
					}
				}
			}
			docs.push(entry)
		}
		if (docs.length > 0){
			this._index = new FlexSearch({
				doc: {
					id: "id",
					field: Object.keys(docs[0]).filter(i=>i!=="id")
				}
			})
			this._index.add(docs)
		}
	}

	search_children = async (filter) => {
		let results
		if (filter.search){
			if (filter.search.length > 1){
				const for_query = []
				for (const query of filter.search){
					for_query.push({
						query,
						field: "meta",
						bool: "and"
					})	
				}
				results = this._index.search(for_query)
			}else if (filter.search.length===1){
				results = this._index.search(filter.search[0])
			}else {
				return this._preset_children
			}
			
		} else {
			return this._preset_children
		}
		
		const {resolved_entries} = await this._data_resolver.resolve_entries({
			model:this.child_model,
			entries: results.map(r=>r.id)}
		)
		const children = []
		for (const r of results){
			const resolved_entry = resolved_entries[r.id]
			if (resolved_entry) children.push(resolved_entry)
		}
		return children
	}
	
	create_value_counts = async (fields, filter) => {
		const value_counts = {}
		for (const child of this._preset_children) {
			for(const field of fields){
				const templateString = '${'+field+'}'
			}
		}
	}

	serialize = async (serialize_parent=true, serialize_children=true) => {
		const entry = await this.entry()
		if (serialize_parent){
			const parent = await this.parent()
			entry[singular_form[this.parent_model]] = parent
		}
		if (serialize_children){
			const children = (await this.children({limit:0}))[this.child_model]
			entry[this.child_model] = children
		}
		return entry
	}

	update_entry = async (updated_entry) => {
		this._entry = {...this._entry, ...updated_entry}
		await this.validate_entry()
	}

	abort = () => {
		this._data_resolver.abort_controller()
	}
}

// export class Signature extends Model {
// 	resolve_children = async (filters) => {
// 		const {
// 			limit=10,
// 			skip=0,
// 			...filter
// 		} = filters
// 		const start = skip
// 		const end = (start + 1) * limit
// 		const {results,
// 			all_entities} = await this._data_resolver.get_entities_from_signatures([this])
// 		this.children_count = results[this.id].length
// 		let entities = results[this.id]
// 		// if limit = 0 get everything
// 		if (limit > 0){
// 			entities = results[this.id].slice(start, end)
// 		}
		
// 		const { resolved_entries } = await this._data_resolver.resolve_entries({
// 				model: this.child_model,
// 				entries: entities,
// 				parent: this
// 			})
// 		this._children = entities.map(e=>resolved_entries[e])
// 	}
// }

// export class Entity extends Model {
// 	resolve_children = async (filters, merge) => {
// 		let repo
// 		if (filters.datatype !== undefined && filters.database !== undefined){
// 			repo = {
// 				repositories: [
// 					{
// 						datatype: filters.datatype,
// 						uuid: filters.database
// 					}
// 				]
// 			}
// 		}
// 		const {
// 			limit=10,
// 			skip=0,
// 			datasets=[],
// 			...filter
// 		} = filters

// 		const query = {
// 			entities: [this.id],
// 			datasets,
// 			...filter,
// 			offset: skip,
				
// 		}
// 		if (limit!==0) {
// 			query.limit = limit
// 		}
// 		const { entries,
// 			count } = await this._data_resolver.get_signatures_from_entities({query, repo, merge})
// 		if (this.child_filter === undefined){
// 			this.child_filter = {[this.child_model]: {}}
			
// 		}
// 		this.child_filter[this.child_model] = Object.entries(entries).reduce((acc,[k,v])=>({
// 			...acc,
// 			[k]: {...v.query, skip: v.query.offset}
// 		}), this.child_filter)
// 		this._children = entries
// 		this.children_count = count
// 	}

// 	children = async (filter={}, merge=false) => {
// 		if (this._children === undefined || Object.keys(filter).length > 0) await this.resolve_children(filter, merge)
// 		const children = {}
// 		for (const [dataset,v] of Object.entries(this._children)) {
// 			if (v.signatures.length>0){
// 				children[dataset] = {
// 					...v,
// 					signatures: [],
// 				}
// 				for (const c of v.signatures){
// 					const child = await c.entry()
// 					child[singular_form[c.parent_model]] = await c.parent()
// 					children[dataset].signatures.push(child)
// 				}
// 			}
// 		  }
// 		return {
// 			count: this.children_count,
// 			[this.child_model]: children
// 		}
// 	}

// 	serialize = async () => {
// 		const entry = await this.entry()
// 		// const parent = await this.parent()
// 		await this.children()
// 		const children = (await this.children())[this.child_model]
// 		// entry[singular_form[this.parent_model]] = parent
// 		entry[this.child_model] = children
// 		return entry
// 	}
// }