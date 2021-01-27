import { fetch_meta_post } from '../fetch/meta'

export const getSearchFilters = async() => {
	const { response } = await fetch_meta_post({
		endpoint: '/schemas/find',
		body: {
		  filter: {
			where: {
			  'meta.$validator': '/dcic/signature-commons-schema/v6/meta/schema/counting.json',
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