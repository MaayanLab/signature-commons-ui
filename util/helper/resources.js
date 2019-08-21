import { fetch_meta } from "../fetch/meta"
import { get_schemas } from "./fetch_methods"
import { objectMatch } from "../objectMatch"
import { makeTemplate } from "../makeTemplate"


export const iconOf = {
  'CREEDS': `static/images/creeds.png`,
  'CMAP': `static/images/clueio.ico`,
}

const default_schemas = []

export async function get_library_resources(schemas=undefined) {
  // fetch schemas if missing
  let all_schemas
  if (schemas===undefined){
    const {schemas: s} = await get_schemas()
    all_schemas = s
  }else{
    all_schemas = schemas
  }
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
    let icon_src
    const resource_id = lib.resource
    // lib resource matches with resource table
    if (resource_id) {
      if (resource_id in resource_meta) {
        const resource = resource_meta[resource_id]
        // find matched schema 
        let matched_schemas = all_schemas.filter(
            (schema) => objectMatch(schema.match, resource)
        )
        if (matched_schemas.length === 0){
          matched_schemas = default_schemas.filter(
            (schema) => objectMatch(schema.match, resource)
          )
        }
        if (matched_schemas.length < 1) {
          console.error('Could not match ui-schema for', resource)
          return null
        }
        let name_prop = Object.keys(matched_schemas[0].properties).filter(prop=> matched_schemas[0].properties[prop].name)
        if (name_prop.length > 0){
          resource_name = makeTemplate(matched_schemas[0].properties[name_prop[0]].text, resource)
        } else {
          console.warn('source of resource name is not defined, using either Resource_Name or ids')
          resource_name = resource.meta['Resource_Name'] || resource_id
        }
        let icon_prop =Object.keys(matched_schemas[0].properties).filter(prop=> matched_schemas[0].properties[prop].icon)

        if (icon_prop.length > 0){
          icon_src = makeTemplate(matched_schemas[0].properties[name_prop[0]].src, resource)
          icon_src = icon_src === 'undefined' ? `${process.env.PREFIX}/static/images/default-black.png`: icon_src
        } else {
          console.warn('source of lib icon is not defined, using default')
          icon_src = 'static/images/default-black.png'
        }
        if (!(resource_name in acc)) {
          resource.libraries = []
          resource.meta.icon = icon_src || `${process.env.PREFIX}/${resource.meta.icon}`
          acc[resource_name] = resource
        }
        acc[resource_name].libraries.push({ ...lib })
      } else {
        console.error(`Resource not found: ${resource_name}`)
      }
    } else {
      // find matched schema 
      let matched_schemas = all_schemas.filter(
          (schema) => objectMatch(schema.match, lib)
      )
      if (matched_schemas.length === 0){
        matched_schemas = default_schemas.filter(
          (schema) => objectMatch(schema.match, lib)
        )
      }

      if (matched_schemas.length < 1) {
        console.error('Could not match ui-schema for', lib)
        return null
      }
      let name_prop = Object.keys(matched_schemas[0].properties).filter(prop=> matched_schemas[0].properties[prop].name)

      if (name_prop.length > 0){
        resource_name = makeTemplate(matched_schemas[0].properties[name_prop[0]].text, lib)
      } else {
        console.warn('source of lib name is not defined, using either dataset or ids')
        resource_name = lib.dataset || lib.id
      }
      let icon_prop = Object.keys(matched_schemas[0].properties).filter(prop=> matched_schemas[0].properties[prop].icon)

      if (icon_prop.length > 0){
        icon_src = makeTemplate(matched_schemas[0].properties[icon_prop[0]].src, lib)
        icon_src = icon_src === 'undefined' ? `${process.env.PREFIX}/static/images/default-black.png`: icon_src
      } else {
        console.warn('source of lib icon is not defined, using default')
        icon_src = 'static/images/default-black.png'
      }
      const { Icon, ...rest } = lib.meta
      acc[resource_name] = {
        id: lib.id,
        meta: {
          ...lib.meta,
          Resource_Name: resource_name,
          icon: icon_src || `${process.env.PREFIX}${iconOf[resource_name]}`,
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