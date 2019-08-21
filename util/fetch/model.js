import { fetch_meta_post } from './meta'
import { fetch_data } from './data'
import { get_library_resources } from '../../components/Resources/resources'

async function PromiseAllSeq(promises) {
  const resolved = []
  for (const promise of promises) {
    resolved.push(await promise())
  }
  return resolved
}

/**
 * The DataProvider facilitates lazy bulk data retrieval while allowing a developer
 *  to think about model manipulation "element by element." This simplifies logic
 *  throughout the code while remaining pretty efficient. Hopefully a user doesn't end up
 *  bringing more data in than can fit into their memory.. (e.g. trying to download all
 *  signatures). If this becomes a problem in the future we can drop data when it gets too
 *  large.
 */
export default class DataProvider {
  constructor() {
    this.resources = {}
    this.libraries = {}
    this.signatures = {}
    this.entities = {}
  }

  async serialize_resource(res, opts) {
    if (opts === undefined) opts = {}

    const resource = await this.resolve_resource(res)
    const serialized = {}

    serialized.id = await resource.id
    serialized.meta = await resource.meta

    if (!opts.fetched_data) {
      if (opts.signatures === true) {
        await this.fetch_signatures_for_libraries(await resource.libraries)
      }

      if (opts.data === true) {
        const signatures = (await PromiseAllSeq((await resource.libraries).map(
            (library) =>
              async () => await library.signatures
        ))).reduce(
            (all, sigs) => [...all, ...sigs], []
        )
        await this.fetch_data_for_signatures(signatures)
      }
    }

    if (opts.libraries === true) {
      serialized.libraries = await PromiseAllSeq(
          (await resource.libraries).map(
              (library) =>
                async () => await this.serialize_library(library, {
                  signatures: opts.signatures,
                  data: opts.data,
                  fetched_data: true,
                })
          )
      )
    }

    return serialized
  }

  async serialize_library(lib, opts) {
    if (opts === undefined) opts = {}

    const library = await this.resolve_library(lib)
    const serialized = {}

    serialized.id = await library.id
    serialized.meta = await library.meta
    serialized.dataset = await library.dataset
    serialized.dataset_type = await library.dataset_type

    if (!opts.fetched_data) {
      if (opts.signatures === true) {
        await this.fetch_signatures_for_libraries([library])
      }

      if (opts.data === true) {
        await this.fetch_data_for_signatures(await library.signatures)
      }
    }

    if (opts.resource === true) {
      serialized.resource = await this.serialize_resource(await library.resource)
    }

    if (opts.signatures === true) {
      serialized.signatures = await PromiseAllSeq(
          (await library.signatures).map(
              (signature) =>
                async () => await this.serialize_signature(signature, {
                  data: opts.data, fetched_data: true,
                })
          )
      )
    }

    return serialized
  }

  async serialize_signature(sig, opts) {
    if (opts === undefined) opts = {}

    const signature = await this.resolve_signature(sig)
    const serialized = {}

    serialized.id = await signature.id
    serialized.meta = await signature.meta

    if (opts.library === true) {
      serialized.library = await this.serialize_library(await signature.library, {
        resource: opts.resource,
      })
    }

    if (opts.data === true) {
      serialized.data = await PromiseAllSeq(
          (await signature.data).map(
              (entity) =>
                async () => await this.serialize_entity(entity)
          )
      )
    }

    return serialized
  }

  async serialize_entity(ent, opts) {
    // TODO: deal with rank data
    if (opts === undefined) opts = {}

    const entity = await this.resolve_entity(ent)
    const serialized = {}

    serialized.id = await entity.id
    serialized.meta = await entity.meta

    if (opts.signature === true) {
      serialized.signature = await this.serialize_signature(await entity.library, {
        library: opts.library, resource: opts.resource,
      })
    }

    return serialized
  }

  resolve_resource = (resource) => {
    if (resource instanceof Resource) {
      return resource
    }

    if (typeof resource === 'string') {
      resource = { 'id': resource }
    }
    if (typeof resource === 'object' && resource.id !== undefined) {
      if (this.resources[resource.id] === undefined) {
        this.resources[resource.id] = new Resource(resource, this)
      }
      return this.resources[resource.id]
    } else {
      throw new Error(`Invalid object provided for resolution: ${resource}`)
    }
  }

  resolve_library = (library) => {
    if (library instanceof Library) {
      return library
    }

    if (typeof library === 'string') {
      library = { 'id': library }
    }
    if (typeof library === 'object' && library.id !== undefined) {
      if (this.libraries[library.id] === undefined) {
        this.libraries[library.id] = new Library(library, this)
      }
      return this.libraries[library.id]
    } else {
      throw new Error(`Invalid object provided for resolution ${library}`)
    }
  }

  resolve_signature = (signature) => {
    if (signature instanceof Signature) {
      return signature
    }

    if (typeof signature === 'string') {
      signature = { 'id': signature }
    }
    if (typeof signature === 'object' && signature.id !== undefined) {
      if (this.signatures[signature.id] === undefined) {
        this.signatures[signature.id] = new Signature(signature, this)
      }
      return this.signatures[signature.id]
    } else {
      throw new Error(`Invalid object provided for resolution: ${signature}`)
    }
  }

  resolve_entity = (entity) => {
    if (entity instanceof Entity) {
      return entity
    }

    if (typeof entity === 'string') {
      entity = { 'id': entity }
    }
    if (typeof entity === 'object' && entity.id !== undefined) {
      if (this.entities[entity.id] === undefined) {
        this.entities[entity.id] = new Entity(entity, this)
      }
      return this.entities[entity.id]
    } else {
      throw new Error(`Invalid object provided for resolution: ${entity}`)
    }
  }

  resolve_resources = async (resources) => {
    return await PromiseAllSeq(
        resources.map(
            (resource) =>
              async () => await this.resolve_resource(resource)
        )
    )
  }

  resolve_libraries = async (libraries) => {
    return await PromiseAllSeq(
        libraries.map(
            (library) =>
              async () => await this.resolve_library(library)
        )
    )
  }

  resolve_signatures = async (signatures) => {
    return await PromiseAllSeq(
        signatures.map(
            (signature) =>
              async () => await this.resolve_signature(signature)
        )
    )
  }

  resolve_entities = async (entities) => {
    return await PromiseAllSeq(
        entities.map(
            (entity) =>
              async () => await this.resolve_entity(entity)
        )
    )
  }

  fetch_resources = async () => {
    const { libraries, resources, library_resource } = await get_library_resources()
    for (const res of Object.values(resources)) {
      const resource = await this.resolve_resource(res)
      resource._fetched = true
      resource._resource = res
      resource._libraries = new Set(await this.resolve_libraries(resource._resource.libraries))
    }
    for (const lib of Object.values(libraries)) {
      // update library
      const library = await this.resolve_library(lib)
      library._fetched = true
      library._library = lib

      // update resource
      if (library_resource[lib.id] !== undefined) {
        library._resource = await this.resolve_resource(library_resource[lib.id])
      }

      // update signatures
      if (library._signatures === undefined) {
        library._signatures = new Set()
      }
      for (const signature of Object.values(this.signatures)) {
        if (lib.id === await (await signature.library).id) {
          library._signatures.add(signature)
        }
      }
    }
  }

  fetch_libraries = async () => {
    await this.fetch_resources()
  }

  fetch_signatures_for_libraries = async (libraries) => {
    // TODO: consider just fetching uuids here so we don't fetch the whole signature if
    //       we already have it
    if (libraries === undefined) libraries = Object.values(this.libraries)

    const { response } = await fetch_meta_post({
      endpoint: `/signatures/find`,
      body: {
        filter: {
          where: {
            library: {
              inq: await PromiseAllSeq(
                  libraries.map(
                      (library) =>
                        async () => await library.id
                  )
              ),
            },
          },
        },
      },
    })
    for (const sig of response) {
      const signature = await this.resolve_signature(sig)
      signature._fetched = true
      signature._signature = sig

      const library = await signature.library
      if (library._signatures === undefined) {
        library._signatures = new Set()
      }
      library._signatures.add(signature)
    }
  }

  fetch_signatures = async () => {
    const signatures = Object.keys(this.signatures).filter((entity) => !this.signatures[entity]._fetched)
    if (signatures.length === 0) {
      return
    }
    const { response } = await fetch_meta_post({
      endpoint: `/signatures/find`,
      body: {
        filter: {
          where: {
            id: {
              inq: signatures,
            },
          },
        },
      },
    })
    for (const sig of response) {
      const signature = await this.resolve_signature(sig)
      signature._fetched = true
      signature._signature = sig

      const library = await signature.library
      if (library._signatures === undefined) {
        library._signatures = new Set()
      }
      library._signatures.add(signature)
    }
  }

  fetch_data_for_signatures = async (signatures) => {
    if (signatures === undefined) signatures = Object.values(this.signatures)
    // filter by signatures not yet fetched
    signatures = (await this.resolve_signatures(signatures)).filter((signature) => !signature._fetched_data)

    // group signatures by (dataset, dataset_type)
    const dataset_with_type_signatures = {}
    for (const signature of signatures) {
      const library = await signature.library
      const dataset_with_type = JSON.stringify([await library.dataset, await library.dataset_type])
      if (dataset_with_type_signatures[dataset_with_type] === undefined) {
        dataset_with_type_signatures[dataset_with_type] = new Set()
      }
      dataset_with_type_signatures[dataset_with_type].add(signature)
    }
    // go through groups and grab signatures
    for (const dataset_with_type of Object.keys(dataset_with_type_signatures)) {
      const [dataset, dataset_type] = JSON.parse(dataset_with_type)
      const cur_signatures = [...dataset_with_type_signatures[dataset_with_type]]

      // get the relevant endpoint to query
      let endpoint
      if (dataset_type.startsWith('geneset')) {
        endpoint = 'set'
      } else if (dataset_type.startsWith('rank')) {
        endpoint = 'rank'
      } else {
        throw new Error(`${dataset_type} not recognized`)
      }
      // construct request with signatures of interest
      const { response } = await fetch_data({
        endpoint: `/fetch/${endpoint}`,
        body: {
          entities: [],
          signatures: await PromiseAllSeq(cur_signatures.map((signature) => async () => await signature.id)),
          database: dataset,
        },
      })
      // resolve results
      // TODO: Deal with rank data differently?
      for (const sig of response.signatures) {
        const signature = await this.resolve_signature(sig.uid)
        signature._fetched_data = true
        if (endpoint === 'set') {
          const entities = await this.resolve_entities(sig.entities)
          signature._data = entities
        } else if (endpoint === 'rank') {
          const ranks = sig.ranks
          ranks.sort((a, b) => a - b)
          const entities = await this.resolve_entities(ranks.map((rank) => response.entities[rank]).filter((ent) => ent !== undefined))
          signature._data = entities
        } else {
          throw new Error(`endpoint ${endpoint} not recognized`)
        }
      }
    }
  }

  fetch_entities = async () => {
    const entities = Object.keys(this.entities).filter((entity) => !this.entities[entity]._fetched)
    if (entities.length === 0) {
      return
    }
    const { response } = await fetch_meta_post({
      endpoint: `/entities/find`,
      body: {
        filter: {
          where: {
            id: {
              inq: entities,
            },
          },
        },
      },
    })
    for (const ent of response) {
      const entity = await this.resolve_entity(ent)
      entity._fetched = true
      entity._entity = ent
    }
  }
}

export class Resource {
  constructor(resource, parent) {
    if (typeof resource === 'object') {
      this._resource = resource
    } else if (typeof resource === 'string') {
      this._resource = { 'id': this.id }
    }

    if (this._resource === undefined || this._resource.id === undefined) {
      throw new Error(`Resource could not be initialized with ${JSON.stringify(resource)}`)
    }

    if (typeof parent === undefined) {
      throw new Error(`Resource should be initialized by libraries`)
    }
    this._parent = parent
  }

  get id() {
    return Promise.resolve(this._resource.id)
  }

  get validator() {
    return Promise.resolve(this._resource['$validator'])
  }

  get libraries() {
    return (async () => {
      if (this._libraries !== undefined) {
        return [...this._libraries]
      }

      await this._parent.fetch_libraries()
      return [...this._libraries]
    })()
  }

  get meta() {
    return (async () => {
      if (this._resource.meta !== undefined) {
        return this._resource.meta
      }

      await this._parent.fetch_resources()
      return this._resource.meta
    })()
  }
}

export class Library {
  constructor(library, parent) {
    if (typeof library === 'object') {
      this._library = library
    } else if (typeof library === 'string') {
      this._library = { 'id': this.id }
    }

    if (this._library === undefined || this._library.id === undefined) {
      throw new Error(`Library could not be initialized with ${JSON.stringify(library)}`)
    }

    if (typeof parent === undefined) {
      throw new Error(`Library should be initialized by libraries`)
    }
    this._parent = parent
  }

  get id() {
    return Promise.resolve(this._library.id)
  }

  get validator() {
    return Promise.resolve(this._library['$validator'])
  }

  get resource() {
    return (async () => {
      if (this._resource !== undefined) {
        return this._resource
      } else if (this._library.resource === undefined) {
        await this._parent.fetch_libraries()
      }

      this._resource = await this._parent.resolve_resource(this._library.resource)
      return this._resource
    })()
  }

  get dataset() {
    return (async () => {
      if (this._library.dataset !== undefined) {
        return this._library.dataset
      }

      await this._parent.fetch_libraries()
      return this._library.dataset
    })()
  }

  get dataset_type() {
    return (async () => {
      if (this._library.dataset_type !== undefined) {
        return this._library.dataset_type
      }

      await this._parent.fetch_libraries()
      return this._library.dataset_type
    })()
  }

  get meta() {
    return (async () => {
      if (this._library.meta !== undefined) {
        return this._library.meta
      }

      await this._parent.fetch_libraries()
      return this._library.meta
    })()
  }

  get signatures() {
    return (async () => {
      if (this._signatures !== undefined && this._signatures.length > 0) {
        return [...this._signatures]
      }

      await this._parent.fetch_signatures_for_libraries([this])
      return [...this._signatures]
    })()
  }
}

export class Signature {
  constructor(signature, parent) {
    if (typeof signature === 'object') {
      this._signature = signature
    } else if (typeof signature === 'string') {
      this._signature = { 'id': this.id }
    }

    if (this._signature === undefined || this._signature.id === undefined) {
      throw new Error(`Signature could not be initialized with ${JSON.stringify(signature)}`)
    }

    if (typeof parent === undefined) {
      throw new Error(`Signature should be initialized by Signatures`)
    }
    this._parent = parent
  }

  get id() {
    return Promise.resolve(this._signature.id)
  }

  get validator() {
    return Promise.resolve(this._signature['$validator'])
  }

  get library() {
    return (async () => {
      if (this._library !== undefined) {
        return this._library
      } else if (this._signature.library === undefined) {
        await this._parent.fetch_signatures()
      }

      this._library = this._parent.resolve_library(this._signature.library)
      return this._library
    })()
  }

  get meta() {
    return (async () => {
      if (this._signature.meta !== undefined) {
        return this._signature.meta
      }

      await this._parent.fetch_signatures()
      return this._signature.meta
    })()
  }

  get data() {
    return (async () => {
      if (this._data !== undefined) {
        return this._data
      }

      await this._parent.fetch_data_for_signatures([this])
      return this._data
    })()
  }
}

export class Entity {
  constructor(entity, parent) {
    if (typeof entity === 'object') {
      this._entity = entity
    } else if (typeof entity === 'string') {
      this._entity = { 'id': this.id }
    }

    if (this._entity === undefined || this._entity.id === undefined) {
      throw new Error(`Entity could not be initialized with ${JSON.stringify(entity)}`)
    }

    if (typeof parent === undefined) {
      throw new Error(`Entity should be initialized by entities`)
    }
    this._parent = parent
  }

  get id() {
    return Promise.resolve(this._entity.id)
  }

  get validator() {
    return Promise.resolve(this._entity['$validator'])
  }

  get meta() {
    return (async () => {
      if (this._entity.meta !== undefined) {
        return this._entity.meta
      }

      await this._parent.fetch_entities()
      return this._entity.meta
    })()
  }
}
