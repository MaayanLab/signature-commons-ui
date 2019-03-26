import { fetch_meta_post } from "./meta";
import { fetch_data } from "./data";
import { get_library_resources } from "../../components/Resources/resources";

export default class DataProvider {
  constructor() {
    this.resources = {}
    this.libraries = {}
    this.signatures = {}
    this.entities = {}
  }

  toJSON(key) { return null }

  resolve_resource = (resource) => {
    if (typeof resource === 'string')
      resource = { 'id': resource }
    if (typeof resource === 'object' && resource.id !== undefined) {
      if (this.resources[resource.id] === undefined)
        this.resources[resource.id] = new Resource(resource, this)
      return this.resources[resource.id]
    } else {
      throw new Error('Invalid object provided for resolution')
    }
  }

  resolve_library = (library) => {
    if (typeof library === 'string')
      library = { 'id': library }
    if (typeof library === 'object' && library.id !== undefined) {
      if (this.libraries[library.id] === undefined)
        this.libraries[library.id] = new Library(library, this)
      return this.libraries[library.id]
    } else {
      throw new Error('Invalid object provided for resolution')
    }
  }

  resolve_signature = (signature) => {
    if (typeof signature === 'string')
      signature = { 'id': signature }
    if (typeof signature === 'object' && signature.id !== undefined) {
      if (this.signatures[signature.id] === undefined)
        this.signatures[signature.id] = new Signature(signature, this)
      return this.signatures[signature.id]
    } else {
      throw new Error('Invalid object provided for resolution')
    }
  }

  resolve_entity = (entity) => {
    if (typeof entity === 'string')
      entity = { 'id': entity }
    if (typeof entity === 'object' && entity.id !== undefined) {
      if (this.entities[entity.id] === undefined)
        this.entities[entity.id] = new Entity(entity, this)
      return this.entities[entity.id]
    } else {
      throw new Error('Invalid object provided for resolution')
    }
  }

  resolve_resources = (resources) => {
    return resources.map(this.resolve_resource)
  }

  resolve_libraries = (libraries) => {
    return libraries.map(this.resolve_library)
  }

  resolve_signatures = (signatures) => {
    return signatures.map(this.resolve_signature)
  }

  resolve_entities = (entities) => {
    return entities.map(this.resolve_entity)
  }

  fetch_resources = async () => {
    const { libraries, resources, library_resource } = await get_library_resources()
    for (const res of Object.values(resources)) {
      const resource = this.resolve_resource(res)
      resource._resource = res
      resource._resource.libraries = this.resolve_libraries(resource._resource.libraries)
    }
    for (const lib of Object.values(libraries)) {
      // update library
      const library = this.resolve_library(lib)
      library._library = lib

      // update resource
      if (library_resource[lib.id] !== undefined)
        library._library.resource = this.resolve_resource(library_resource[lib.id])

      // update signatures
      if (library._signatures === undefined)
        library._signatures = new Set()
      for (const signature of Object.values(this.signatures)) {
        if (lib.id === (await signature.library).id)
          library._signatures.push(signature)
      }
    }
  }

  fetch_libraries = async () => {
    await this.fetch_resources()
  }

  fetch_signatures_for_libraries = async () => {
    const { response } = await fetch_meta_post({
      endpoint: `/signatures/find`,
      body: {
        filter: {
          where: {
            library: {
              inq: Object.keys(this.libraries)
            }
          }
        }
      }
    })
    for (const sig of response) {
      const signature = this.resolve_signature(sig)
      signature._signature = sig

      const library = this.resolve_library(sig.library)
      if (library._signatures === undefined)
        library._signatures = new Set()
      library._signatures.add(signature)
    }
  }

  fetch_signatures = async () => {
    const { response } = await fetch_meta_post({
      endpoint: `/signatures/find`,
      body: {
        filter: {
          where: {
            id: {
              inq: Object.keys(this.signatures)
            }
          }
        }
      }
    })
    for (const sig of response) {
      const signature = this.resolve_signature(sig)
      signature._signature = sig

      const library = this.resolve_library(sig.library)
      if (library._signatures === undefined)
        library._signatures = new Set()
      library._signatures.add(signature)
    }
  }

  fetch_entities = async () => {
    const { response } = await fetch_meta_post({
      endpoint: `/entities/find`,
      body: {
        filter: {
          where: {
            id: {
              inq: Object.keys(this.entities)
            }
          }
        }
      }
    })
    for (const ent of response) {
      const entity = this.resolve_entity(ent)
      entity._entity = ent
    }
  }
}

export class Resource {
  constructor(resource, parent) {
    if (typeof resource === 'object')
      this._resource = resource
    else if (typeof resource === 'string')
      this._resource = { 'id': this.id }
    
    if (this._resource === undefined || this._resource.id === undefined)
      throw new Error(`Resource could not be initialized with ${JSON.stringify(resource)}`)

    if (typeof parent === undefined)
      throw new Error(`Resource should be initialized by libraries`)
    this._parent = parent
  }

  toJSON(key) { return this._resource }

  get id() {
    return Promise.resolve(this._resource.id)
  }

  get libraries() {
    return (async () => {
      if (this._resource.libraries !== undefined)
        return this._resource.libraries

      await this._parent.fetch_libraries()
      return this._resource.libraries
    })()
  }

  get meta() {
    return (async () => {
      if (this._resource.meta !== undefined)
        return this._resource.meta

      await this._parent.fetch_resources()
      return this._resource.meta
    })()
  }
}

export class Library {
  constructor(library, parent) {
    if (typeof library === 'object')
      this._library = library
    else if (typeof library === 'string')
      this._library = { 'id': this.id }
    
    if (this._library === undefined || this._library.id === undefined)
      throw new Error(`Library could not be initialized with ${JSON.stringify(library)}`)

    if (typeof parent === undefined)
      throw new Error(`Library should be initialized by libraries`)
    this._parent = parent
  }

  toJSON(key) { return this._library }

  get id() {
    return Promise.resolve(this._library.id)
  }

  get dataset() {
    return (async () => {
      if (this._library.dataset !== undefined)
        return this._library.dataset

      await this._parent.fetch_libraries()
      return this._library.dataset
    })()
  }

  get meta() {
    return (async () => {
      if (this._library.meta !== undefined)
        return this._library.meta

      await this._parent.fetch_libraries()
      return this._library.meta
    })()
  }

  get signatures() {
    return (async () => {
      if (this._signatures !== undefined)
        return this._signatures
      
      await this._parent.fetch_signatures_for_libraries()
      return this._signatures
    })()
  }
}

export class Signature {
  constructor(signature, parent) {
    if (typeof signature === 'object')
      this._signature = signature
    else if (typeof signature === 'string')
      this._signature = { 'id': this.id }
    
    if (this._signature === undefined || this._signature.id === undefined)
      throw new Error(`Signature could not be initialized with ${JSON.stringify(signature)}`)

    if (typeof parent === undefined)
      throw new Error(`Signature should be initialized by Signatures`)
    this._parent = parent
  }

  toJSON(key) { return this._signature }

  get id() {
    return Promise.resolve(this._signature.id)
  }

  get library() {
    return (async () => {
      if (typeof this._signature.library === 'string') {
        this._signature.library = this._parent.resolve_library(this._signature.library)
        return this._signature.library
      } else if (this._signature.library !== undefined) {
        return this._signature.library
      }
      await this._parent.fetch_signatures()
      await this._parent.fetch_libraries()
      return this._signature.library
    })()
  }

  get meta() {
    return (async () => {
      if (this._signature.meta !== undefined)
        return this._signature.meta

      await this._parent.fetch_signatures()
      return this._signature.meta
    })()
  }

  get data() {
    // TODO
    return (async () => {
      return {}
      if (this._signature.data !== undefined)
        return this._signature.data

      const library = await this.library
      const { response } = await fetch_data({
        // endpoint: `/fetch/${await library.dataset_type}`,
        endpoint: '/fetch/set',
        body: {
          entities: [],
          signatures: [await this.id],
          database: await library.dataset,
        }
      })
      console.log(response)
      const entities = response.entities.reduce(
        (entities, id) => ({...entities, [id]: Entity(id, this._parent)}),
        {}
      )
      this._signature.data = entities
      return this._signature.data
    })()
  }
}

export class Entity {
  constructor(entity, parent) {
    if (typeof entity === 'object')
      this._entity = entity
    else if (typeof entity === 'string')
      this._entity = { 'id': this.id }
    
    if (this._entity === undefined || this._entity.id === undefined)
      throw new Error(`Entity could not be initialized with ${JSON.stringify(entity)}`)

    if (typeof parent === undefined)
      throw new Error(`Entity should be initialized by entities`)
    this._parent = parent
  }

  toJSON(key) { return this._entity }

  get id() {
    return Promise.resolve(this._entity.id)
  }

  get meta() {
    return (async () => {
      if (this._entity.meta !== undefined)
        return this._entity.meta

      await this._parent.fetch_entities()
      return this._entity.meta
    })()
  }
}
