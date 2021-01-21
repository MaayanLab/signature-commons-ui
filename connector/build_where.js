import isUUID from 'validator/lib/isUUID'

function process_search_clauses(search_clauses) {
	let where = {}
	if (search_clauses.or.length > 0) {
	  if (search_clauses.and.length > 0) {
		// or takes precedence over and
		where['or'] = [...search_clauses.or, { and: search_clauses.and }]
	  } else {
		where['or'] = search_clauses.or
	  }
	} else {
	  // no or
	  where['and'] = search_clauses.and
	}
	if (search_clauses.not.length > 0) {
	  if (where.and !== undefined) {
		where = {
		  ...where,
		  and: [
			...where.and,
			...search_clauses.not,
		  ],
		}
	  } else if (where.or !== undefined) {
		// not takes precedence
		where = {
		  and: [
			{ ...where },
			...search_clauses.not,
		  ],
		}
	  } else {
		where = {
		  ...where,
		  and: search_clauses.not,
		}
	  }
	}
	return { where }
  }
  
export function build_where({ search, filters, order, indexed_keys }) {
	search = search || []
	if (search.length === 0 && filters === undefined && order === undefined) return undefined
	let where = {}
	const search_clauses = {
	  and: [],
	  or: [],
	  not: [],
	  fullTextSearch: {
		and: [],
		or: [],
		not: [],
	  },
	}
  
	for (const q of search) {
	  let search_term = q
	  let context = 'and'
	  if (q.startsWith('!') || q.startsWith('-')) {
		// and not
		search_term = q.substring(1)
		context = 'not'
	  } else if (q.toLowerCase().startsWith('or ')) {
		search_term = q.substring(3)
		context = 'or'
	  } else if (q.startsWith('|')) {
		search_term = q.substring(1)
		context = 'or'
	  }
	  search_term = search_term.trim()
	  if (isUUID(search_term)) {
		const search_query = {
		  id: context === 'not' ? { ne: search_term } : search_term,
		}
		search_clauses[context].push(search_query)
	  } else if (search_term.indexOf(':') !== -1) {
		const [key, ...value] = q.split(':')
		if (indexed_keys.indexOf(`meta.${key.trim()}`) !== -1) {
		  // it is indexed
		  const search_query = {
			[`meta.${key.trim()}`]: context === 'not' ? { nilike: '%' + value.join(':') + '%' } : { ilike: '%' + value.join(':') + '%' },
		  }
		  search_clauses[context].push(search_query)
		} else {
		  // fulltextsearch
		  if (context === 'not') {
			search_clauses.fullTextSearch[context].push({ ne: search_term })
		  } else {
			search_clauses.fullTextSearch[context].push(search_term)
		  }
		}
	  } else {
		// fulltextsearch
		if (context === 'not') {
		  search_clauses.fullTextSearch[context].push({ ne: search_term })
		} else {
		  search_clauses.fullTextSearch[context].push(search_term)
		}
	  }
	}
	if (search.length > 0){
	  const { where: fullTextSearch } = process_search_clauses(search_clauses.fullTextSearch)
	  if (search_clauses.and.length === 0 && search_clauses.or.length === 0 && search_clauses.not.length === 0) {
		where = { meta: { fullTextSearch } }
	  } else {
		if (Object.values(fullTextSearch).filter((v) => (v.length > 0)).length > 0) {
		  search_clauses.and.push({ meta: { fullTextSearch } })
		}
		const { where: w } = process_search_clauses(search_clauses)
		where = w
	  }
	}
  
  
	if (filters !== undefined) {
	  if (where.and === undefined) {
		where = {
		  and: [{ ...where }],
		}
	  }
	  for (const [filter, values] of Object.entries(filters)) {
		if (filter.indexOf('..') === -1) {
		  const and = []
		  const or = []
		  for (const v of values){
			if (isUUID(v)){
			  or.push({
				[filter]: v
			  })
			}else {
			  and.push({
				[filter]: {ilike: `%${v}%`},
			  })
			}
		  }
		  where = {
			and: [...where.and, {
			  or,
			},
			],
		  }
		  if (or.length > 0) where.and.push({or})
		  // where = {
		  //   and: [...where.and, {
		  //     [filter]: { inq: [...values] },
		  //   },
		  //   ],
		  // }
		}
	  }
	}
  
	if (order !== undefined) {
	  if (where.and === undefined) {
		where = {
		  and: [{ ...where }],
		}
	  }
	  where = {
		and: [...where.and, {
		  [order]: { neq: null },
		},
		],
	  }
	}
  
	return where
  }
  