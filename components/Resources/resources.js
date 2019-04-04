import { fetch_meta_post } from '../../util/fetch/meta';

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

    if (groups[resource] === undefined) {
      groups[resource] = {
        id: resource,
        meta: {
          name: resource,
          icon: `${process.env.PREFIX}/${iconOf[resource] || lib.meta['Icon']}`,
          description: resource_meta[resource].Description,
          PMID: resource_meta[resource].PMID,
          URL: resource_meta[resource].URL,
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
  console.log(resources)
  return {
    libraries: library_dict,
    resources: resources,
    library_resource,
  }
}