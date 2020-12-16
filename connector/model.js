import isUUID from 'validator/lib/isUUID'
import merge from 'deepmerge'

const validate = require('@maayanlab/signature-commons-schema').validate.bind({})

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
		this._parent = parent_mapper[model] !== null ? parent: null
		this._children = undefined
        this._children_count = undefined
        this.model = model
        this.parent_model = parent_mapper[model]
		this.child_model = child_mapper[model]
		if (typeof entry === "string" && isUUID(entry)){
			this._entry = {"id": entry}
            this.resolved = false 
		}else if (!(entry instanceof Array) && typeof entry === "object"){
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
					entries: [this]
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
		if (this.parent_model == null) {
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
		if (filter.where!==undefined){
			filter.where = {
				and: [
					filter.where,
					{
						[singular_form[this.model]]: this.id
					}
				]
			}
		}else {
			filter.where = {
				[singular_form[this.model]]: this.id
			}
		}
		filter = {
			limit: 10,
			...filter
		}
		const { entries, count} = await this._data_resolver.filter_metadata({
			model: this.child_model,
			filter: filter,
			parent: this
		})
		this._children = entries
		this._children_count = count
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

	children = async (filter={}) => {
		if (this._children === undefined || Object.keys(filter).length > 0) await this.resolve_children(filter)
		const children = []
		for (const c of Object.values(this._children)){
			const child = await c.entry()
			child[singular_form[c.parent_model]] = await c.parent()
			children.push(child)
		}
		return {
			count: {
				[this.child_model]: this._children_count,
			},
			[this.child_model]: children
		}
	}

	serialize = async (serialize_parent=true, serialize_children=true) => {
		const entry = await this.entry()
		if (serialize_parent){
			const parent = await this.parent()
			entry[singular_form[this.parent_model]] = parent
		}
		if (serialize_children){
			const children = (await this.children())[this.child_model]
			entry[this.child_model] = children
		}
		return entry
	}

	update_entry = async (updated_entry) => {
		this._entry = merge(this._entry, updated_entry)
		await this.validate_entry()
	}

	abort = () => {
		this._data_resolver.abort_controller()
	}
}

export class Signature extends Model {
	resolve_children = async (filters) => {
		const {
			limit=10,
			skip=0,
			...filter
		} = filters
		const start = skip
		const end = (start + 1) * limit
		const {results,
			all_entities} = await this._data_resolver.get_entities_from_signatures([this])
		this._children_count = results[this.id].length
		let entities = results[this.id]
		// if limit = 0 get everything
		if (limit > 0){
			entities = results[this.id].slice(start, end)
		}
		
		const { resolved_entries } = await this._data_resolver.resolve_entries({
				model: this.child_model,
				entries: entities,
				parent: this
			})
		this._children = entities.map(e=>resolved_entries[e])
	}
}

export class Entity extends Model {
	resolve_children = async (filters) => {
		const {
			limit=10,
			skip=0,
			datasets=[],
			...filter
		} = filters

		const query = {
			entities: [this.id],
			datasets,
			offset: skip,
			...filter	
		}
		if (limit!==0) {
			query.limit = limit
		}
		const { entries,
			count } = await this._data_resolver.get_signatures_from_entities({query})
		this._children = entries
		this._children_count = count
	}

	children = async (filter={}) => {
		if (this._children === undefined || Object.keys(filter).length > 0) await this.resolve_children(filter)
		const children = {}
		for (const [dataset,v] of Object.entries(this._children)) {
			if (v.signatures.length>0){
				children[dataset] = {
					...v,
					signatures: [],
				}
				for (const c of v.signatures){
					const child = await c.entry()
					child[singular_form[c.parent_model]] = await c.parent()
					children[dataset].signatures.push(child)
				}
			}
		  }
		return {
			count: this._children_count,
			[this.child_model]: children
		}
	}

	serialize = async () => {
		const entry = await this.entry()
		// const parent = await this.parent()
		await this.children()
		const children = (await this.children())[this.child_model]
		// entry[singular_form[this.parent_model]] = parent
		entry[this.child_model] = children
		return entry
	}
}