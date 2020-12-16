import { makeTemplate, makeTemplateForObject } from './makeTemplate'
import { findMatchedSchema, objectMatch } from './objectMatch'

export const value_by_type = {
	'text': ({ label, prop, data }) => {
	  const val = makeTemplate(prop.text, data)
	  let hyperlink
	  if (prop.hyperlink !== undefined) hyperlink = makeTemplate(prop.hyperlink, data)
	  if (val === 'undefined') {
		return null
	  } else {
		return { text: val, hyperlink, label }
	  }
	},
	'img': ({ label, prop, data }) => {
	  const src = makeTemplate(prop.src, data)
	  const alt = makeTemplate(prop.alt, data)
	  let text = makeTemplate(prop.text, data)
	  let hyperlink
	  if (prop.hyperlink !== undefined) hyperlink = makeTemplate(prop.hyperlink, data)
	  if (alt === 'undefined') {
		return null
	  } else {
		if (text === 'undefined') text = alt
		return { label, alt, src, text, hyperlink }
	  }
	},
	'object': ({ label, prop, data }) => {
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

      if (prop.visibility && prop.visibility > 0 && objectMatch(prop.condition, data)) {
        const val = value_by_type[prop.type]({ label, prop, data, highlight })
        if (prop.name) {
          info.name = { text: data.id }
          if (val !== null) {
            info.name = { ...info.name, ...val }
          }
        }
        if (prop.subtitle) {
          if (val !== null) info.subtitle = { ...val }
        }
        if (prop.display) {
          if (val !== null) info.display[label] = { ...val }
        }
        if (prop.icon) {
          if (val !== null) {
            info.icon = { ...val }
          }
        }
        if (prop.homepage) {
          info.homepage = { ...val }
        }
        if (prop.download) {
          if (val !== null) {
            download = [
              ...download,
              {
                ...val,
                icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
                priority: prop.priority,
              },
            ]
          }
        }
        if (prop.score) {
          if (val !== null) {
            scores[prop.Field_Name] = {
              label,
              value: val.text,
              field_name: prop.Field_Name,
              icon: prop.MDI_Icon || 'mdi-star',
            }
            sort_tags[prop.Field_Name] = {
              label,
              field_name: prop.Field_Name,
              icon: prop.MDI_Icon || 'mdi-star',
            }
          }
        }
        if (prop.keywords) {
          // TODO: Update schemas so it has list
          if (val !== null) {
            keywords[label] = {
              label,
              value: val.object,
              icon: prop.MDI_Icon || 'mdi-tag-multiple',
            }
          }
        }
        if (!(prop.score || prop.icon || prop.name || prop.subtitle || prop.display || prop.keywords | prop.download)) {
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


