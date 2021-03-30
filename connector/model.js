import isUUID from 'validator/lib/isUUID'
import FlexSearch from 'flexsearch'
import { makeTemplate } from '../util/ui/makeTemplate'
import {empty_cleaner} from './build_where'

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
		if (entry === undefined){
			throw new Error(`Undefined entry`)
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
				throw new Error(`Invalid entry id`)
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
				if (this._entry[parent_model] === undefined) this._parent = null
				else this._parent = new Model(this.parent_model, this._entry[parent_model], this._data_resolver)
			}
			if (this._parent !== null) await this._parent.resolve_entry()
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
		
		if (this.model === "signatures" || this.model === "entities"){
			if (this._children === undefined) {
				this._children = {}
				this.children_count = {}
			}
			filter = {
				...filter,
				where: {...filter.where || {}}
			}
			const direction = filter.where.direction
			if (direction !== undefined){
				const { entries, count} = await this._data_resolver.filter_through({
					model: this.model,
					entry: this,
					filter: filter,
				})
				const field = direction === "-" ? this.child_model: direction
				this._children[field] = entries
				this.children_count[field] = count
			}else {
				for (const dir of ['-', 'up', 'down']){
					filter.where.direction = dir
					const { entries, count} = await this._data_resolver.filter_through({
						model: this.model,
						entry: this,
						filter: filter,
					})
					const field = dir === "-" ? this.child_model: dir
					this._children[field] = entries
					this.children_count[field] = count
				}
			}
			
		} else {
			const { entries, count} = await this._data_resolver.filter_through({
				model: this.model,
				entry: this,
				filter: filter,
			})
			this._children = {[this.child_model]: entries}
			this.children_count = {[this.child_model]: count}
			
		}
	}

	entry = async () => {
		if (!this.resolved) await this.resolve_entry()
		return this._entry
	}

	parent = async () => {
		if (this._parent === null) return null
		if (this._parent === undefined || !this._parent.resolved) await this.resolve_parent()
		if (this._parent === null) return null
		return await this._parent.entry()
	}

	parent_object = async () => {
		if (this._parent === null) return null
		if (this._parent === undefined || !this._parent.resolved){
			await this.resolve_parent()
		}
		return this._parent
	}

	get_child_object = async (id) => {
		if (this._preset_children){
			const child = this._preset_children.filter(c=>c.id === id)
			return child[0]
		}else {
			this.resolve_children({where: {id}})
			return this._children[0]
		}
	}

	children = async (filter={}, crawl=false) => {
		if (this._preset_children!==null && this._preset_children!==undefined){
			return this.search_children(filter, crawl)
		}else{
			// Proper API Call
			if (this._children === undefined || Object.keys(filter).length > 0) await this.resolve_children(filter)
			const children = {}
			for (const [k,v] of Object.entries(this._children)){
				children[k] = []
				for (const c of Object.values(v)){
					const child = await c.entry()
					child[singular_form[c.parent_model]] = await c.parent()
					children[k].push(child)
				}
			}
			return {
				...children,
				count: this.children_count
			}
		}
	}

	sort_children_by_score = (children, order_by, ordering) => {
		children.sort((a,b)=>{
			if (ordering === "DESC") return (b.scores[order_by] || -9999)-(a.scores[order_by] || -9999)
			else return (a.scores[order_by] || 9999)-(b.scores[order_by] || 9999)
		})
		return children
	}

	set_children = async (entries=[]) => {
		const {resolved_entries} = await this._data_resolver.resolve_entries({
			model:this.child_model,
			entries}
		)
		const children = {}
		const children_count = {}
		for (const e of entries){
			const entry = await e.entry()
			let direction = entry.direction || this.child_model
			if (direction === "-") direction = this.child_model
			if (children[direction]===undefined){
				children[direction] = []
				children_count[direction] = 0
			}
			const entry_id = typeof entry === 'object' ? entry.id: entry
			const resolved_entry = resolved_entries[entry_id]
			if (resolved_entry){
				if (typeof entry === 'object') resolved_entry.update_entry(entry)
				children[direction].push(resolved_entry)
				children_count[direction] = children_count[direction] + 1
			}
		}
		this._preset_children = children
		this.children_count = children_count
	}

	// get_children_ids = async (direction=this.child_model) => {
	// 	if (this._preset_children!==undefined) return this._preset_children[direction].map(c=>c.id)
	// 	if (this._children === undefined) await this.children()
	// 	return Object.keys(this._children)
		
	// }

	create_search_index = async (schema=null, grandchild=false) => {
		// If grandchild is true, then it will serialize the grandchild
		if (this._index !== undefined) return
		const docs = []
		for (const [direction,v] of Object.entries(this._preset_children)){
			for (const child of v){
				const e = await child.serialize(true, grandchild)
				const entry = {
					id: e.id,
					meta: JSON.stringify(e),
					scores: e.scores || {},
					direction,
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
	
	filter_preset_children = async (filter, crawl=false) => {
		const {order=[], limit=10, skip=0} = filter
		const order_by = order[0]
		const ordering = order[1]
		const children = {}
		const count = {}
		for (const [k,v] of Object.entries(this._preset_children)){
			let children_list = []
			for (const c of v){
				let child
				if (crawl && this.child_model !== "entities"){
					child = await c.serialize(true, true, crawl)
				} else {
					child = await c.serialize(true, false)
				}
				children_list.push(child)
			}
			count[k] = children_list.length
			if (order_by) children_list = this.sort_children_by_score(children_list, order_by, ordering)
			children[k] = limit===0 ? children_list: children_list.slice(skip, skip+limit)
		}
		
		return { children, count }
	}

	search_children = async (filter, crawl=false) => {
		const {search, id, order=[], limit=10, skip=0} = filter
		if (id){
			const children = {}
			const count = {}
			for (const [k,v] of Object.entries(this._preset_children)){
				children[k] = []
				for (const c of v){
					if (c.id === id){
						let child
						if (crawl && this.child_model !== "entities"){
							child = await c.serialize(true, true, crawl)
						} else {
							child = await c.serialize(true, false)
						}
						children[k].push(child)
					}
				}
				count[k] = children[k].length
			}
			
			return {
				...children,
				count,
			}
		} else if (search===undefined || search.length===0){
			const {children, count} = await this.filter_preset_children(filter, crawl)
			return {
				...children,
				count,
			}
		} else {
			const [order_by, ordering] = order
			const options = {}
			// if (limit > 0) {
			// 	options.limit = limit
			// 	options.page = true
			// }
			if (order_by!==undefined){
				if (ordering === "DESC") {
					options.sort = (a,b) => ((b.scores[order_by] || -9999)-(a.scores[order_by] || -9999))
				} else {
					options.sort = (a,b) => ((a.scores[order_by] || 9999)-(b.scores[order_by] || 9999))
				}
			}
			const query = []
			for (const q of filter.search){
				query.push({
					query: q,
					field: "meta",
					bool: "and"
				})	
			}
			const children = {}
			const count = {}
			for (const direction of Object.keys(this._preset_children)){
				children[direction] = []
				const results = this._index.search([...query, {
					query: direction,
					field: "direction",
					bool: "and"
				}], options)
				const for_resolving = limit===0 ? results: results.slice(skip, skip+limit)
				const {resolved_entries} = await this._data_resolver.resolve_entries({
					model:this.child_model,
					entries: for_resolving.map(r=>r.id)}
				)
				count[direction] = results.length
				for (const r of results){
					const c = await resolved_entries[r.id]
					if (c) {
						let child
						if (crawl && this.child_model !== "entities"){
							child = await c.serialize(true, true, crawl)
						} else {
							child = await c.serialize(true, false)
						}
						children[direction].push(child)
					}
				}
			}

			return {
				...children,
				count
			}
		}
	}
	
	create_value_counts = async (fields, filter) => {
		const value_counts = {}
		for (const child of this._preset_children) {
			for(const field of fields){
				const templateString = '${'+field+'}'
			}
		}
	}

	serialize = async (serialize_parent=true, serialize_children=true, crawl=false) => {
		const entry = await this.entry()
		if (serialize_parent){
			const parent = await this.parent()
			entry[singular_form[this.parent_model]] = parent
		}
		if (serialize_children){
			const children = (await this.children({limit:0}, crawl))[this.child_model]
			entry[this.child_model] = children
		}
		return empty_cleaner(entry)
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