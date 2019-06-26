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

  // We used predefined schema to fetch resource meta
  const resource_ui = (await import('../../ui-schemas/resources/sigcom.json')).default

  // fetch resources on database
  const { response } = await fetch_meta({
    endpoint: '/resources',
  })

  // fetch libraries on database
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })
  const count_promises = libraries.map(async (lib) => {
    // request details from GitHub’s API with Axios
    const { response: stats } = await fetch_meta({
      endpoint: `/libraries/${lib.id}/signatures/key_count`,
      body: {
        fields: ['$validator'],
      },
    })

    return {
      id: lib.id,
      name: lib.meta.Library_name,
      count: stats.$validator,
    }
  })
  const counts = await Promise.all(count_promises)
  const count_dict = counts.reduce((acc, item)=>{
    acc[item.id] = item.count
    return acc
  }, {})

  const resource_meta = response.reduce((group, data) => {
    group[data.id] = data
    return group
  }, {})


  const resources = libraries.reduce((acc, lib) => {
    const resource_id = lib.resource
    const resource_name = resource_from_library.map((res) => (lib.meta[res])).filter((res_name) => (res_name))[0] || null
    // lib resource matches with resource table
    if (resource_id) {
      if (resource_id in resource_meta){
        let resource = resource_meta[resource_id]
        if (!(resource_name in acc)){
          resource.libraries = []
          resource.meta.Signature_Count = 0
          acc[resource_name] = resource
        }
        resource.meta.Signature_Count = resource.meta.Signature_Count + count_dict[lib.id]
        acc[resource_name].libraries.push({...lib})
      } else {
        console.error(`Resource not found: ${resource_name}`)
      }
    } else {
      acc[resource_name] = {
        id: lib.id,
        meta: {
          Resource_Name: resource_name,
          icon: `${process.env.PREFIX}/${iconOf[resource_name] || lib.meta['Icon'] || 'static/images/default-black.png'}`,
          Signature_Count: count_dict[lib.id],
        },
        is_library: true,
        libraries: [lib],
      }
      // Get metadata from library
      const r_meta = Object.entries(resource_ui.properties).map((entry) => {
          const prop = entry[1]
          const field = prop.field
          const text = makeTemplate(prop.text, lib)
          return ([field, text])
        }).filter((entry) => (entry[1] !== 'undefined')).reduce((acc1, entry) => {
          acc1[entry[0]] = entry[1]
          return acc1
        }, {})
      acc[resource_name].meta = { ...acc[resource_name].meta, ...r_meta }
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
    counts,
  }
}

export async function get_signature_counts_per_resources(resource_from_library) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const { libraries, resources, library_resource, counts } = await get_library_resources(resource_from_library)
  // const count_promises = Object.keys(library_resource).map(async (lib) => {
  //   // request details from GitHub’s API with Axios

  //   const { response: stats } = await fetch_meta({
  //     endpoint: `/libraries/${lib}/signatures/key_count`,
  //     body: {
  //       fields: ['$validator'],
  //     },
  //   })

  //   return {
  //     name: library_resource[lib],
  //     count: stats.$validator,
  //   }
  // })
  // const counts = await Promise.all(count_promises)

  const resource_signatures = counts.reduce((groups, lib) => {
    const resource_name = library_resource[lib.id]
    if (groups[resource_name] === undefined) {
      groups[resource_name] = lib.count
    } else {
      groups[resource_name] = groups[resource_name] + lib.count
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
