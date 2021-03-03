import { fetch_meta, fetch_meta_post } from '../fetch/meta'
import merge from 'deepmerge'
import { makeTemplate } from './makeTemplate'
import {defaultUIValues, defaultTheme} from './ui_values'
import { createMuiTheme } from '@material-ui/core'
import {fill_palette} from './fill_palette'

// getSearchFilters.js
export const getSearchFilters = async () => {
	const { response } = await fetch_meta_post({
		endpoint: '/schemas/find',
		body: {
		  filter: {
			where: {
			  'meta.$validator': {
				ilike: '%' + 'schema/counting.json' + '%',
				},
			  'meta.type': 'filter'
			},
		  },
		},
	  })
	const filters = {}
	for (const i of response){
		const model = i.meta.model
		if (filters[model] === undefined) filters[model] = []
		filters[model].push(i["meta"])
	}
	return filters
}

export const getSummary = async () => {
	const { response: summary } = await fetch_meta({
		endpoint: '/summary',
	  })
	console.log(summary)
	return summary
}

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

export const get_ui_values = async () => {
	const { response: ui_val } = await fetch_meta_post({
	  endpoint: '/schemas/find',
	  body: {
		filter: {
		  where: {
			'meta.$validator': {
				ilike: '%' + 'schema/landing-ui.json' + '%',
			},
			'meta.landing': true,
		  },
		},
	  },
	})
	const values = ui_val.length > 0 ? ui_val[0].meta.content : {}
	const ui_values = merge(defaultUIValues, values, { arrayMerge: overwriteMerge })
	if (ui_values.background_props.style && ui_values.background_props.style.backgroundImage) {
		ui_values.background_props.style.backgroundImage = 'url(' + makeTemplate(ui_values.background_props.style.backgroundImage, {}) + ')'
	  }
	return ui_values
  }

export const get_theme = (theme_mod) => {
	const theme = createMuiTheme(merge(defaultTheme, theme_mod))
	theme.shadows[4] = theme.shadows[0]
	// Get variables for offsetting colors
    const tonalOffset = theme.palette.tonalOffset
    const contrastThreshold = theme.palette.contrastThreshold
    // fill theme
    theme.palette = Object.entries(theme.palette).reduce((acc, [key, val]) => {
		if (val.main !== undefined) {
		  acc[key] = fill_palette(val, tonalOffset, contrastThreshold)
		} else {
		  acc[key] = val
		}
		return acc
	  }, {})
	
	return theme
}

export const get_search_models = async () => {
	const search_models = []
	for (const model in ["resources", "libraries", "signatures", "entities"]){
		const { response } = await fetch_meta({ endpoint: `/${model}/count`})
 		if (response.count) search_models.push(model)
	}
	return search_models
}

export const getSchemas = async () => {
	const { response } = await fetch_meta_post({
		endpoint: '/schemas/find',
		body: {
		  filter: {
			where: {
			  	'meta.$validator': {
					ilike: '%' + 'schema/ui-schema.json' + '%',
				},
			},
		  },
		},
	  })
	const schemas = response.map(r=>r.meta)
	return schemas
}

export const get_initial_props = async () => {
	const {theme_mod, ...ui_values} = await get_ui_values()
	const theme = await get_theme(theme_mod)
	const schemas = await getSchemas()
	return { ui_values, theme, schemas }
}
