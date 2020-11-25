import isUUID from 'validator/lib/isUUID'
import merge from 'deepmerge'

const validate = require('@maayanlab/signature-commons-schema').validate.bind({})

const singular_form = {
    resources: "resource",
    libraries: "library",
    signatures: "signature",
    entities: "entity"
}

const parent_mapper = {
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
		this._parent = parent
		this._children = undefined
        this._children_count = undefined
        this._model = model
        this._parent_model = parent_mapper[model]
		this._child_model = child_mapper[model]
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
		try {
			await validate(this._entry)
			this.resolved = true
		} catch (error) {
			console.error(error)
			this.resolved = false
		}
		return this.resolved
	}

	resolve_entry = async () => {
		await this.validate_entry()
		if (!this.resolved){
			const {resolved_entries, invalid_entries} = await this._data_resolver.resolve_entries(
				{
					model: this._model,
					entries: [this]
				}
			)
			if (resolved_entries[this.id]!==undefined){
				this._entry = resolved_entries[this.id]
				this.resolved = true
			} else {
				throw new Error(`Cannot resolve ${singular_form[this._model]} with id ${this._entry.id}`)
			}
		}
	}

	resolve_parent = async () => {
		if (!this.resolved) await this.resolve_entry()
		if (this._parent_model == null) {
			this._parent = null
		}else {
			if (this._parent === undefined){
				const parent_model = singular_form[this._parent_model]
				this._parent = new Model(this._parent_model, this._entry[parent_model], this._data_resolver)
			}
			await this._parent.resolve_entry()
		}
	}

	resolve_children = async ({...filter}) => {
		if (filter.where!==undefined){
			filter.where = {
				and: [
					filter.where,
					{
						[singular_form[this._model]]: this.id
					}
				]
			}
		}else {
			filter.where = {
				[singular_form[this._model]]: this.id
			}
		}
		filter = {
			limit: 10,
			...filter
		}
		const { entries, count} = await this._data_resolver.filter_metadata({
			model: this._child_model,
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
		if (this._parent === undefined) await this.resolve_parent()
		if (this._parent === null) return null
		return await this._parent.entry()
	}

	children = async () => {
		if (this._children === undefined) await this.resolve_children()
		return {
			count: this._children_count,
			[this._child_model]: this._children
		}
	}

	serialize = async () => {
		const entry = await this.entry()
		const parent = await this.parent()
		await this.children()
		const children = []
		for (const child of Object.values(this._children)) {
			children.push(await child.entry())
		  }
		entry[singular_form[this._parent_model]] = parent
		entry[this._child_model] = children
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
	resolve_children = async ({limit=10, skip=0, ...filter}={limit:10, skip:0}) => {
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
				model: this._child_model,
				entries: entities,
				parent: this
			})
		this._children = entities.map(e=>resolved_entries[e])
	}
}

export class Entity extends Model {
	resolve_children = async ({limit, ...filter}={limit:10}) => {
		const query = {
			entities: [this.id],
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

	serialize = async () => {
		const entry = await this.entry()
		// const parent = await this.parent()
		await this.children()
		const children = {}
		for (const [dataset,v] of Object.entries(this._children)) {
			if (v.length>0){
				children[dataset] = []
				for (const child of v)
					children[dataset].push(await child.entry())
			}
		  }
		// entry[singular_form[this._parent_model]] = parent
		entry[this._child_model] = children
		return entry
	}
}