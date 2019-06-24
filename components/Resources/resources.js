import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta'
import { makeTemplate } from '../../util/makeTemplate'

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

export async function get_library_resources(resource_from_library) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const response = (await import('../../ui-schemas/resources/all.json')).default
  const resource_ui = (await import('../../ui-schemas/resources/mcf10a.json')).default // We used predefined schema to fetch resource meta
  const resource_meta = response.reduce((group, data) => {
    group[data.Resource_Name] = data
    return group
  }, {})
  const { response: libraries } = await fetch_meta_post({ endpoint: '/libraries/find', body: {} })
  const library_dict = libraries.reduce((L, l) => ({ ...L, [l.id]: l }), {})

  const resources = {}
  for (const lib of libraries) {
    const resource = resource_from_library.map((res) => (lib.meta[res])).filter((res_name) => (res_name))[0] || null
    if (resource_meta[resource] === undefined) {
      console.error(`Resource not found: ${resource}`)
    }

    if (resources[resource] === undefined) {
      if (resource_meta[resource] === undefined) {
        console.warn(`Resource not found: ${resource}, registering library as resource`)
        const { response: Signature_Count } = await fetch_meta({ endpoint: `/libraries/${lib.id}/signatures/count` })
        resources[resource] = {
          id: lib.id,
          meta: {
            name: resource,
            icon: `${process.env.PREFIX}/${iconOf[resource] || lib.meta['Icon'] || 'static/images/default-black.png'}`,
            Signature_Count: Signature_Count.count,
          },
          is_library: true,
          libraries: [],
        }
        const r_meta = Object.entries(resource_ui.properties).map((entry) => {
          const prop = entry[1]
          const field = prop.field
          const text = makeTemplate(prop.text, lib)
          return ([field, text])
        }).filter((entry) => (entry[1] !== 'undefined')).reduce((acc, entry) => {
          acc[entry[0]] = entry[1]
          return acc
        }, {})
        resources[resource].meta = { ...resources[resource].meta, ...r_meta }
      } else {
        resources[resource] = {
          id: resource,
          meta: {
            name: resource,
            icon: `${process.env.PREFIX}/${iconOf[resource] || lib.meta['Icon']}`,
            Signature_Count: resource_meta[resource].Signature_Count, // Precomputed
          },
          is_library: false,
          libraries: [],
        }
        const r_meta = Object.entries(resource_ui.properties).map((entry) => {
          const prop = entry[1]
          const field = prop.field
          const text = makeTemplate(prop.text, lib)
          return ([field, text])
        }).filter((entry) => (entry[1] !== 'undefined')).reduce((acc, entry) => {
          acc[entry[0]] = entry[1]
          return acc
        }, {})
        resources[resource].meta = { ...resources[resource].meta, ...r_meta }
      }
    }
    resources[resource].libraries.push({ ...lib })
  }

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

export async function get_signature_counts_per_resources(resource_from_library) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const { libraries, resources, library_resource } = await get_library_resources(resource_from_library)
  const count_promises = Object.keys(library_resource).map(async (lib) => {
    // request details from GitHub’s API with Axios

    const { response: stats } = await fetch_meta({
      endpoint: `/libraries/${lib}/signatures/key_count`,
      body: {
        fields: ['$validator'],
      },
    })

    return {
      name: library_resource[lib],
      count: stats.$validator,
    }
  })
  const counts = await Promise.all(count_promises)

  const resource_signatures = counts.reduce((groups, resource) => {
    if (groups[resource.name] === undefined) {
      groups[resource.name] = resource.count
    } else {
      groups[resource.name] = groups[resource.name] + resource.count
    }
    return groups
  }, {})
  // let for_sorting = Object.keys(resource_signatures).map(resource=>({name: resource,
  //                                                                    counts: resource_signatures[resource]}))

  // for_sorting.sort(function(a, b) {
  //     return b.counts - a.counts;
  // });
  return {
    resource_signatures, // for_sorting.slice(0,11)
    libraries,
    resources,
    library_resource,
  }
}
