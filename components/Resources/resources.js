import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta';

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
  'CMAP'
]

export const renamed = {
  'Human Phenotype Ontology': 'HPO',
  'MGI Mammalian Phenotype': 'MGI-MP',
  'Cancer Cell Line Encyclopedia': 'CCLE',
  'NCI': 'NCI Pathways',
  'Disease Signatures': 'CREEDS',
  'Single Drug Perturbations': 'CREEDS',
  'Single Gene Perturbations': 'CREEDS',
  'clueio': 'CMAP',
  'GEO': 'CREEDS',
  'TRANSFAC AND JASPAR': 'TRANSFAC & JASPAR',
  'ENCODE/ChEA': 'ENCODE',
  'Gene Ontology Consortium': 'Gene Ontology',
  'PubMed': 'Enrichr',
}

export const iconOf = {
  'CREEDS': `static/images/creeds.png`,
  'CMAP': `static/images/clueio.ico`,
}

export async function get_library_resources() {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const response = (await import("../../ui-schemas/resources/all.json")).default
  const resource_meta = response.reduce((group, data)=>{
    group[data.Resource_Name] = data
    return group
  }, {})
  const { response: libraries } = await fetch_meta_post({ endpoint: '/libraries/find', body: {} })
  const library_dict = libraries.reduce((L, l) => ({...L, [l.id]: l}), {})
  const resources = libraries.reduce((groups, lib) => {
    let resource = renamed[lib.meta['Primary_Resource'] || lib.meta['name']] || lib.meta['Primary_Resource'] || lib.meta['name']
    if ((lib.meta['Library_name'] || '').indexOf('ARCHS4') !== -1)
      resource = 'ARCHS4'
    if (resource === 'Enrichr')
      return groups
      
    if (resource_meta[resource] === undefined)
      console.error(`Resource not found: ${resource}`)

    if (groups[resource] === undefined) {
      groups[resource] = {
        id: resource,
        meta: {
          name: resource,
          icon: `${process.env.PREFIX}/${iconOf[resource] || lib.meta['Icon']}`,
          description: (resource_meta[resource] || {}).Description,
          PMID: (resource_meta[resource] || {}).PMID,
          URL: (resource_meta[resource] || {}).URL,
          Signature_Count: resource_meta[resource].Signature_Count, // Precomputed
        },
        libraries: []
      }
    }
    groups[resource].libraries.push({...lib})
    return groups
  }, {})
  const library_resource = Object.keys(resources).reduce((groups, resource) => {
    for (const library of resources[resource].libraries)
      groups[library.id] = resource
    return groups
  }, {})
  return {
    libraries: library_dict,
    resources: resources,
    library_resource,
  }
}

export async function get_signature_counts_per_resources(controller=null) {
  // const response = await fetch("/resources/all.json").then((res)=>res.json())
  const {library_resource} = await get_library_resources()

  const count_promises = Object.keys(library_resource).map(async lib => {
    // request details from GitHub’s API with Axios
    const url = '/signatures' +
              '/key_count?filter={"fields":["$validator"], "where": {"library": "'
              + lib +'"}}'
    const { response: stats} = await fetch_meta({
      endpoint: url,
      signal: controller? controller.signal: null
    })

    return {
      name: library_resource[lib],
      count: stats.$validator
    }
  })
  const counts = await Promise.all(count_promises)
  
  const per_resource_counts = counts.reduce((groups, resource) => {
    if (groups[resource.name] === undefined){
      groups[resource.name] = resource.count
    }else {
      groups[resource.name] = groups[resource.name] + resource.count
    }
    return groups
  }, {})
  // let for_sorting = Object.keys(per_resource_counts).map(resource=>({name: resource,
  //                                                                    counts: per_resource_counts[resource]}))

  // for_sorting.sort(function(a, b) {
  //     return b.counts - a.counts;
  // });
  return {
    resource_signatures: per_resource_counts//for_sorting.slice(0,11)
  }
}