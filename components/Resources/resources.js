import { fetch_meta } from '../../util/fetch/meta'

export const primary_resources = [
  'CREEDS',
  'ARCHS4',
  'KEGG',
  'GTEx',
  'ENCODE',
  'HPO',
  'CCLE',
  'Allen Brain Atlas',
  'Achilles',
]

export const primary_two_tailed_resources = [
  'CMAP',
]

export const iconOf = {
  'CREEDS': `static/images/creeds.png`,
  'CMAP': `static/images/clueio.ico`,
}

export async function get_library_resources(ui_values) {
  // fetch resources on database
  const { response } = await fetch_meta({
    endpoint: '/resources',
  })

  // fetch libraries on database
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })

  const resource_meta = response.filter((resource) => !resource.meta.$hidden).reduce((group, data) => {
    group[data.id] = data
    return group
  }, {})


  const resources = libraries.reduce((acc, lib) => {
    let resource_name
    const resource_id = lib.resource
    // lib resource matches with resource table
    if (resource_id) {
      if (resource_id in resource_meta) {
        const resource = resource_meta[resource_id]
        if ('resource_name' in ui_values && ui_values.resource_name !== undefined) {
          resource_name = resource.meta[ui_values.resource_name]
        } else {
          console.warn('source of resource name is not defined, using either Resource_Name or ids')
          resource_name = resource.meta['Resource_Name'] || resource_id
        }
        if (!(resource_name in acc)) {
          resource.libraries = []
          resource.meta.icon = `${process.env.PREFIX}${resource.meta.icon}`
          acc[resource_name] = resource
        }
        acc[resource_name].libraries.push({ ...lib })
      } else {
        console.error(`Resource not found: ${resource_name}`)
      }
    } else {
      resource_name = ui_values.resource_name_from_library ? lib.meta[ui_values.resource_name_from_library] : lib.dataset
      const { Icon, ...rest } = lib.meta
      acc[resource_name] = {
        id: lib.id,
        meta: {
          Resource_Name: resource_name,
          icon: `${process.env.PREFIX}/${iconOf[resource_name] || Icon || 'static/images/default-black.png'}`,
          ...rest,
        },
        is_library: true,
        libraries: [lib],
      }
    }
    return acc
  }, {})

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
  }
}

export async function get_signature_counts_per_resources(ui_values) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const { libraries, resources, library_resource } = await get_library_resources(ui_values)
  // const count_promises = Object.keys(library_resource).map(async (lib) => {
  //   // request details from GitHub’s API with Axios
  const count_promises = Object.keys(libraries).map(async (lib_key) => {
    const lib = libraries[lib_key]
    // request details from GitHub’s API with Axios
    const { response: stats } = await fetch_meta({
      endpoint: `/libraries/${lib_key}/signatures/count`,
    })

    return {
      id: lib.id,
      name: lib.meta[ui_values.library_name],
      count: stats.count,
    }
  })
  const counts = await Promise.all(count_promises)
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
    acc[resource.meta.Resource_Name] = resource
    return acc
  }, {})
  counts.reduce
  const resource_signatures = counts.reduce((groups, lib) => {
    const resource_name = library_resource[lib.id]
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
    libraries,
    resources: resources_with_counts,
    library_resource,
  }
}
