import { makeTemplate } from './makeTemplate'
import { findMatchedSchema, objectMatch } from './objectMatch'

export const value_by_type = {
	'text': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, label }
	  }
  },
  'url': ({ label, prop, data }) => {
    const url = makeTemplate(prop.url, data)
    const text = makeTemplate(prop.text, data)
	  if (url === 'undefined') {
		  return null
	  } else {
		  return { text, url, label }
	  }
  },
  'display': ({ label, prop, data }) => {
    const url = makeTemplate(prop.href, data)
    const text = makeTemplate(prop.text, data)
	  if (url === 'undefined') {
		  return null
	  } else {
		  return { text, url, label }
	  }
  },
  'title': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, label }
	  }
  },
  'subtitle': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, label }
	  }
  }, 
  'alternative': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, label }
	  }
  },
	'img': ({ label, prop, data }) => {
	  const src = makeTemplate(prop.src, data)
	  const alt = makeTemplate(prop.alt, data)
	  if (alt === 'undefined') {
		return null
	  } else {
		  return { label, alt, src }
	  }
  },
  'head-img': ({ label, prop, data }) => {
	  const src = makeTemplate(prop.src, data)
	  const alt = makeTemplate(prop.alt, data)
	  if (alt === 'undefined') {
		return null
	  } else {
  		return { label, alt, src }
	  }
	},
	'array': ({ label, prop, data }) => {
    const extracted_str = makeTemplate('${JSON.stringify(' + prop.field + ')}', data)
    if (extracted_str === 'undefined'){
      return null
    }else {
      const extracted = JSON.parse(extracted_str)
      if (extracted.length === 0) return null
      const val = []
      for (const i of extracted){
        if (typeof i === 'object' && prop.text !== undefined && prop.text!==""){
          val.push(makeTemplate(prop.text, i))
        } else {
          val.push(i)
        }
      }
      return { object: val, label }
    }
  },
  'score': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, label }
	  }
  },
  'download': ({ label, prop, data }) => {
    const props = {}
    for (const [k,v] of Object.entries(prop.props)){
      const val = value_by_type[v.type]({label: k, prop: v, data})
      if (val!==null) props[k] = val
    }
    if (Object.keys(props).length ===0) return null
    else return {label, props}
  },
  'prop-array': ({label, prop, data}) => {
    
    const props = []
    for (const i of prop.items){
      const val = value_by_type[i.type]({label, prop: i, data})
      if (val!==null){
        if (i.type === 'text') {
          props.push(val.text)
        }else{
          props.push(val)
        }
      }
    }
    if (props.length ===0) return null
    else return props
  },
  'prop-object': ({label, prop, data}) => {
    const props = {}
    for (const [k,v] of Object.entries(prop.properties)){
      const val = value_by_type[v.type]({label:k, prop: v, data})
      if (val!==null){
        if (v.type==='text'){
          props[k] = val.text
        } else {
          props[k] = val
        }
      }
    }
    if (Object.keys(props).length ===0) return null
    else return props
  },
  'component': ({label, prop, data}) => {
    const props = {}
    for (const [k,v] of Object.entries(prop.props)){
      const val = value_by_type[v.type]({label: k, prop: v, data})
      if (val!==null) props[k] = val
    }
    if (Object.keys(props).length ===0) return null
    else return {label, props}
  }
}

export const props_resolver = (properties, data, info=null) => {
  if (info===null) info={}
  for (const [label, props] of Object.entries(properties)) {

  }
  
}

export const getPropType = (data, schemas, type) => {
  const schema = findMatchedSchema(data, schemas)
  const values = []
  if (schema !== null) {
    for (const [label, prop] of Object.entries(schema.properties)) {
      if (prop.visibility && prop.type===type){
        const val = value_by_type[prop.type]({ label, prop, data })
        if (val!==null) values.push({...val, priority: prop.priority || 1})
      }
    }
  }
  return values
}

export const getName = (data, schemas) => {
  const schema = findMatchedSchema(data, schemas)
  if (schema !== null) {
    for (const prop of Object.values(schema.properties)) {
      if (prop.visibility && prop.type==="title"){
        const val = value_by_type[prop.type]({ label: "title", prop, data })
        if (val!==null) return val.text
      }
    }
  }
  return null
}

export const labelGenerator = (data, schemas, endpoint=undefined, highlight=undefined) => {
  const schema = findMatchedSchema(data, schemas)
  if (schema !== null) {
    const { properties } = schema
    const scores = {}
    let tags = []
    const keywords = {}
    const info = { id: data.id, display: {}, url: {}, components: {}, name: { text: data.id }}
    if (endpoint){
      info.endpoint = endpoint + data.id
    }
    const sort_tags = {}
    for (const label of Object.keys(properties)) {
      const prop = properties[label]
      // if (prop.component === "download") prop.type = "download"
      if (prop.component){
      }
      if (objectMatch(prop.condition, data) && value_by_type[prop.type]!==undefined) {
        const val = value_by_type[prop.type]({ label, prop, data })
        if (prop.synonyms){
          if (info.synonyms===undefined) info.synonyms = []
          if (prop.type === "array"){
            if (val!==null) info.synonyms = [...info.synonyms, ...val.object]
          }else {
            if (val!==null) info.synonyms = [...info.synonyms, val.text]
          }
        }
        if (prop.type === "title") {
          if (val !== null) {
            info.name = { ...info.name,
              ...val,
              field: prop.field,
              priority: prop.priority,
              visibility: prop.visibility,
            }
          }
        }
        if (prop.type === "subtitle") {
          if (val !== null) info.subtitle = { 
            ...val,
            field: prop.field, 
            priority: prop.priority,
            visibility: prop.visibility,
          }
        }
        if (prop.type === "alternative") {
          if (val !== null) info.alternative = { ...val, field: prop.field, }
        }
        if (prop.type === "display") {
          if (info.display === undefined ) info.display = {}
          if (val !== null) info.display[label] = { ...val, field: prop.field, }
        }
        if (prop.type === "url") {
          if (info.url === undefined ) info.url = {}
          if (val !== null) info.url[label] = { ...val }
        }
        if (prop.type === "img" || prop.type === "head-img") {
          if (val !== null) {
            info.icon = { ...val }
          }
        }
        if (prop.type === "score") {
          if (val !== null) {
            scores[prop.field] = {
              label,
              value: val.text,
              field: prop.field,
              icon: prop.icon || 'mdi-star',
              priority: prop.priority,
              visibility: prop.visibility,
            }
            sort_tags[prop.field] = {
              label,
              field: prop.field,
              icon: prop.icon || 'mdi-star',
            }
          }
        }
        if (prop.type === "array") {
          // TODO: Update schemas so it has list
          if (val !== null) {
            if (val !== null) {
              keywords[label] = {
                label,
                value: val.object,
                icon: prop.icon || 'mdi-tag-multiple',
              }
            }
          }
        }
        // if (prop.type === "download") {
        //   if (val !== null) {
        //     info.download = val
        //   }
        // }
        if (prop.type === "component") {
          if (val !== null) {
            info.components[prop.component] = val
          }
        }
        if (prop.type==="text") {
          if (val !== null) {
            tags = [...tags, {
              ...val,
              icon: prop.icon || 'mdi-arrow-top-right-thick',
              priority: prop.priority,
              visibility: prop.visibility,
              clickable: prop.clickable || true,
              field: prop.search_field || prop.field,
            }]
          }
        }
      }
    }
    tags = tags.sort((a, b) => a.priority - b.priority)
    if (Object.keys(scores).length > 0) info.scores = scores
    info.tags = tags || []
    // info.download = download || []
    info.keywords = keywords
    return { data, info, schema, sort_tags }
  }
}


