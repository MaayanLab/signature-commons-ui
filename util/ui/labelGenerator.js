import { makeTemplate, makeTemplateForObject } from './makeTemplate'
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
	  if (prop.keywords) {
		const val = makeTemplateForObject('${JSON.stringify(' + prop.Field_Name + ')}', data, prop.text)
		if (val === 'undefined' || val.length === 0) {
		  return null
		} else {
		  return { object: val, label }
		}
	  } else {
		const val = makeTemplateForObject('${JSON.stringify(' + prop.Field_Name + ')}', data, prop.text)
		if (val === 'undefined' || val.length === 0) {
		  return null
		} else {
		  return { text: val, label }
		}
	  }
	},
	'list': ({ label, prop, data }) => {
	  const val = makeTemplateForObject(prop.text, data, prop.subtext || null)
	  if (val === 'undefined' || val.length === 0) {
		return null
	  } else {
		return { list: val, label }
	  }
	},
  }

export const labelGenerator = (data, schemas, endpoint="", highlight = undefined) => {
  const schema = findMatchedSchema(data, schemas)
  if (schema !== null) {
    const { properties } = schema
    const scores = {}
    let tags = []
    let download = []
    const keywords = {}
    const info = { id: data.id, display: {}, endpoint: endpoint + data.id }
    const sort_tags = {}
    for (const label of Object.keys(properties)) {
      const prop = properties[label]

      if (prop.visibility && prop.visibility > 0 && objectMatch(prop.condition, data) && value_by_type[prop.type]!==undefined) {
        const val = value_by_type[prop.type]({ label, prop, data, highlight })
        if (prop.type === "title") {
          info.name = { text: data.id }
          if (val !== null) {
            info.name = { ...info.name, ...val }
          }
        }
        if (prop.type === "subtitle") {
          if (val !== null) info.subtitle = { ...val }
        }
        if (prop.type === "display") {
          if (val !== null) info.display[label] = { ...val }
        }
        if (prop.type === "img" || prop.type === "head-img") {
          if (val !== null) {
            info.icon = { ...val }
          }
        }
        // if (prop.type === "component" && prop.text=== "download") {
        //   if (val !== null) {
        //     download = [
        //       ...download,
        //       {
        //         ...val,
        //         icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
        //         priority: prop.priority,
        //       },
        //     ]
        //   }
        // }
        if (prop.type === "score") {
          if (val !== null) {
            scores[prop.field] = {
              label,
              value: val.text,
              field_name: prop.field,
              icon: prop.MDI_Icon || 'mdi-star',
            }
            sort_tags[prop.field] = {
              label,
              field_name: prop.field,
              icon: prop.MDI_Icon || 'mdi-star',
            }
          }
        }
        if (prop.type === "array") {
          // TODO: Update schemas so it has list
          if (val !== null) {
            keywords[label] = {
              label,
              value: val.object,
              icon: prop.MDI_Icon || 'mdi-tag-multiple',
            }
          }
        }
        if (prop.type==="text") {
          if (val !== null) {
            tags = [...tags, {
              ...val,
              icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
              priority: prop.priority,
              clickable: prop.clickable,
            }]
          }
        }
      }
    }
    tags = tags.sort((a, b) => a.priority - b.priority)
    if (Object.keys(scores).length > 0) info.scores = scores
    info.tags = tags || []
    info.download = download || []
    info.keywords = keywords
    return { data, info, sort_tags }
  }
}


