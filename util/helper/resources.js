import { fetch_meta } from '../fetch/meta'
import { get_schemas } from './fetch_methods'
import { objectMatch, default_schemas } from '../objectMatch'
import { makeTemplate } from '../makeTemplate'


export const iconOf = {
  'CREEDS': `static/images/creeds.png`,
  'CMAP': `static/images/clueio.ico`,
}

export async function get_library_resources() {
  // fetch schemas if missing
  const schemas = await get_schemas('/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json')
  // fetch resources on database
  const { response } = await fetch_meta({
    endpoint: '/resources',
  })

  // fetch libraries on database
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })

  const resource_meta = {}
  for (const resource of response) {
    if (!resource.meta.$hidden) {
      resource_meta[resource.id] = resource
    }
  }
  const resources_id = {}
  const resources = {}

  for (const lib of libraries) {
    let resource_name
    const resource_id = lib.resource
    // lib resource matches with resource table
    if (resource_id!==undefined) {
      if (resource_id in resource_meta) {
        const resource = resource_meta[resource_id]
        // find matched schema
        let matched_schemas = schemas.filter(
            (schema) => objectMatch(schema.match, resource)
        )
        if (matched_schemas.length === 0) {
          matched_schemas = default_schemas.filter(
              (schema) => objectMatch(schema.match, resource)
          )
        }
        if (matched_schemas.length < 1) {
          console.error('Could not match ui-schema for', resource)
          return null
        }
        let name_prop = Object.keys(matched_schemas[0].properties).filter((prop) => matched_schemas[0].properties[prop].name)
        if (name_prop.length > 0) {
          name_prop = matched_schemas[0].properties[name_prop[0]]
          resource_name = makeTemplate(name_prop.text, resource)
        } else {
          console.warn('source of resource name is not defined, using either Resource_Name or ids')
          resource_name = resource.meta['Resource_Name'] || resource_id
        }
        if (resources[resource_name] === undefined) {
          resource.libraries = []
          // resource.meta.icon = icon_src || `${process.env.PREFIX}/${resource.meta.icon}`
          resources[resource_name] = resource
        }
        resources[resource_name].libraries.push({ ...lib })
        resources_id[resource_id] = resource
      } else {
        console.error(`Resource not found: ${resource_name} ${resource_id}`)
      }
    } else {
      // find matched schema
      let matched_schemas = schemas.filter(
          (schema) => objectMatch(schema.match, lib)
      )
      if (matched_schemas.length === 0) {
        matched_schemas = default_schemas.filter(
            (schema) => objectMatch(schema.match, lib)
        )
      }

      if (matched_schemas.length < 1) {
        console.error('Could not match ui-schemas for', lib)
        return null
      }
      const name_props = Object.keys(matched_schemas[0].properties).filter((prop) => matched_schemas[0].properties[prop].name)
      const name_prop = name_props[0].text || "${id}"
      const resource_name = makeTemplate(name_prop, lib)
      // render only library as resource if resource table is empty
      // if (response.length === 0) {
      //   resources[resource_name] = {
      //     ...lib,
      //     libraries: [lib],
      //   }
      // }
      resources[resource_name] = {
        ...lib,
        libraries: [lib],
      }
    }
  }
  const library_dict = libraries.reduce((L, l) => ({ ...L, [l.id]: l }), {})

  const library_resource = Object.keys(resources).reduce((groups, resource) => {
    for (const library of resources[resource].libraries) {
      groups[library.id] = resource
    }
    return groups
  }, {})
  return {
    libraries: library_dict,
    resources: resources,
    library_resource,
    resources_id,
  }
}

export async function get_signature_counts_per_resources(ui_values) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const { libraries, resources, resources_id, library_resource } = await get_library_resources()
  // const count_promises = Object.keys(library_resource).map(async (lib) => {
  //   // request details from GitHub’s API with Axios
  const { response } = await fetch_meta({
    endpoint: `/signatures/count`,
  })
  let counts
  if (response.count > 0) {
    const count_promises = Object.keys(libraries).map(async (lib_key) => {
      const lib = libraries[lib_key]
      // request details from GitHub’s API with Axios
      const { response: stats } = await fetch_meta({
        endpoint: `/libraries/${lib_key}/signatures/count`,
      })

      return {
        id: lib.id,
        name: lib.meta[ui_values.library_name] || lib.dataset,
        count: stats.count,
      }
    })
    counts = await Promise.all(count_promises)
  } else {
    return {
      libraries,
      resources,
      library_resource,
      resources_id,
    }
  }
  const count_dict = counts.reduce((acc, item) => {
    acc[item.id] = item.count
    return acc
  }, {})
  const total_count = counts.reduce((acc, item) => {
    acc = acc + item.count
    return acc
  }, 0)

  const resources_with_counts = Object.values(resources).map((resource) => {
    const total_sigs = resource.libraries.reduce((acc, lib) => {
      acc = acc + count_dict[lib.id]
      return acc
    }, 0)
    resource.meta.Signature_Count = total_sigs
    return (resource)
  }).reduce((acc, resource) => {
    acc[resource.meta.Resource_Name || makeTemplate(ui_values.resource_name, resource)] = resource
    return acc
  }, {})
  const resource_signatures = counts.reduce((groups, lib) => {
    const resource_name = library_resource[lib.id] || lib.dataset
    if (groups[resource_name] === undefined) {
      groups[resource_name] = lib.count
    } else {
      groups[resource_name] = groups[resource_name] + lib.count
    }
    if (lib.count !== undefined) {

    }
    return groups
  }, {})

  // let for_sorting = Object.keys(resource_signatures).map(resource=>({name: resource,
  //                                                                    counts: resource_signatures[resource]}))

  // for_sorting.sort(function(a, b) {
  //     return b.counts - a.counts;
  // });
  return {
    resource_signatures: total_count === 0 ? undefined : resource_signatures, // for_sorting.slice(0,11)
    resources: resources_with_counts,
    library_resource,
    resources_id,
  }
}
