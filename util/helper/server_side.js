import { fetch_meta, fetch_meta_post } from '../fetch/meta'
import { makeTemplate } from '../makeTemplate'
import { get_schemas } from './fetch_methods'
import { objectMatch, findMatchedSchema } from '../objectMatch'

export async function fetch_count(source) {
  const { response } = await fetch_meta({ endpoint: `/${source}/count`,
  })
  return response.count
}

export async function get_counts(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Table_Count': true,
        },
      },
    },
  })
  let table_counts
  if (counting_fields.length > 0) {
    if (ui_values.preferred_name === undefined) {
      ui_values.preferred_name = {}
    }
    const count_promise = counting_fields.map(async (item) => {
      const count_stats = await fetch_count(item.meta.Field_Name)
      ui_values.preferred_name[item.meta.Field_Name] = item.meta.Preferred_Name
      return {
        table: item.meta.Field_Name,
        preferred_name: item.meta.Preferred_Name,
        icon: item.meta.MDI_Icon,
        Visible_On_Landing: item.meta.Visible_On_Landing,
        counts: count_stats,
      }
    })
    table_counts = await Promise.all(count_promise)
  } else {
    if (ui_values.preferred_name !== undefined) {
      const count_promise = Object.keys(ui_values.preferred_name).filter((key) => key !== 'resources').map(async (key) => {
        const count_stats = await fetch_count(key)
        return {
          table: key,
          preferred_name: ui_values.preferred_name[key],
          Visible_On_Landing: count_stats > 0,
          icon: 'mdi-arrow-top-right-thick',
          counts: count_stats,
        }
      })
      table_counts = await Promise.all(count_promise)
    }
  }
  return { table_counts, ui_values }
}

export async function get_metacounts(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Meta_Count': true,
        },
      },
    },
  })
  if (counting_fields.length === 0) {
    return ({ meta_counts: {} })
  }

  const meta_promise = counting_fields.map(async (entry) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${entry.meta.Table}/distinct_value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [entry.meta.Field_Name],
        },
      },
    })
    return meta_stats
  })

  const meta = await Promise.all(meta_promise)
  const meta_stats = meta.reduce((mapping, item) => {
    mapping = { ...item, ...mapping }
    return mapping
  }, {})
  const meta_counts = counting_fields.reduce((stat_list, item) => {
    const k = item.meta.Field_Name
    stat_list.push({ name: item.meta.Preferred_Name,
      counts: meta_stats[k],
      icon: item.meta.MDI_Icon,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Field_Name })
    return (stat_list)
  }, [])

  meta_counts.sort((a, b) => parseFloat(b.counts) - parseFloat(a.counts))
  return { meta_counts }
}

export async function get_piecounts(ui_values) {
  const { response: piefields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Pie_Count': true,
        },
      },
    },
  })

  const meta_promise = piefields.map(async (entry) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${entry.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [entry.meta.Field_Name],
        },
      },
    })
    return meta_stats
  })

  const meta = await Promise.all(meta_promise)
  const meta_stats = meta.reduce((mapping, item) => {
    mapping = { ...item, ...mapping }
    return mapping
  }, {})
  const pie_stats = piefields.map((item) => {
    return {
      key: item.meta.Preferred_Name || item.meta.Field_Name,
      Preferred_Name: item.meta.Preferred_Name_Singular || item.meta.Preferred_Name || item.meta.Field_Name,
      table: item.meta.Table,
      stats: meta_stats[item.meta.Field_Name] || {},
      slice: item.meta.Slice || 14,
    }
  })
  const piecounts = pie_stats.reduce((piestats, stats) => {
    piestats[stats.Preferred_Name] = { stats: Object.entries(stats.stats).map(([name, counts]) => ({ name, counts })),
      table: ui_values.preferred_name[stats.table], Preferred_Name: stats.Preferred_Name, slice: stats.slice }
    return piestats
  }, {})

  return { piecounts }
}

export async function get_wordcounts(ui_values) {
  const { response: wordfields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Word_Count': true,
        },
      },
    },
  })

  const meta_promise = wordfields.map(async (entry) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${entry.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [entry.meta.Field_Name],
          limit: 100,
        },
      },
    })
    return meta_stats
  })

  const meta = await Promise.all(meta_promise)
  const meta_stats = meta.reduce((mapping, item) => {
    mapping = { ...item, ...mapping }
    return mapping
  }, {})
  const word_stats = wordfields.map((item) => {
    return {
      key: item.meta.Preferred_Name || item.meta.Field_Name,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Field_Name,
      table: item.meta.Table,
      stats: meta_stats[item.meta.Field_Name] || {},
      slice: item.meta.Slice || 14,
    }
  })
  const wordcounts = word_stats.reduce((wordstats, stats) => {
    wordstats[stats.Preferred_Name] = { stats: Object.entries(stats.stats).map(([name, counts]) => ({ name, counts })),
      table: ui_values.preferred_name[stats.table], Preferred_Name: stats.Preferred_Name, slice: stats.slice }
    return wordstats
  }, {})

  return { wordcounts }
}

export async function get_barcounts(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Bar_Count': true,
        },
      },
    },
  })
  const meta_promise = counting_fields.map(async (item) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${item.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [item.meta.Field_Name],
          limit: 25,
        },
      },
    })
    const stats = Object.keys(meta_stats[item.meta.Field_Name] || {}).reduce((accumulator, bar) => {
      const count = meta_stats[item.meta.Field_Name][bar]
      if (accumulator[bar] === undefined) {
        accumulator[bar] = count
      } else {
        accumulator[bar] = accumulator[bar] + count
      }
      return accumulator
    }, {}) // TODO: Fix this as schema
    return { meta: item.meta, stats: stats }
  })

  const meta = await Promise.all(meta_promise)
  const barcounts = meta.reduce((accumulator, item) => {
    accumulator[item.meta.Preferred_Name || item.meta.Field_Name] = {
      key: item.meta.Preferred_Name || item.meta.Field_Name,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Field_Name,
      table: item.meta.Table,
      stats: Object.entries(item.stats).map(([name, counts]) => ({ name, counts })),
    }
    return accumulator
  }, {})
  return { barcounts }
}

export async function get_histograms(ui_values) {
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Histogram': true,
        },
      },
    },
  })
  const meta_promise = counting_fields.map(async (item) => {
    const { response: meta_stats } = await fetch_meta({
      endpoint: `/${item.meta.Table}/value_count`,
      body: {
        depth: 2,
        filter: {
          fields: [item.meta.Field_Name],
        },
      },
    })
    const stats = Object.keys(meta_stats[item.meta.Field_Name] || {}).reduce((accumulator, bar) => {
      const count = meta_stats[item.meta.Field_Name][bar]
      if (bar === '2017b') {
        if (accumulator['2017'] === undefined) {
          accumulator['2017'] = count
        } else {
          accumulator['2017'] = accumulator['2017'] + count
        }
      } else {
        if (accumulator[bar] === undefined) {
          accumulator[bar] = count
        } else {
          accumulator[bar] = accumulator[bar] + count
        }
      }
      return accumulator
    }, {}) // TODO: Fix this as schema
    return { meta: item.meta, stats: stats }
  })

  const meta = await Promise.all(meta_promise)
  const histograms = meta.reduce((accumulator, item) => {
    accumulator[item.meta.Preferred_Name || item.meta.Field_Name] = {
      key: item.meta.Preferred_Name || item.meta.Field_Name,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Field_Name,
      table: item.meta.Table,
      stats: Object.entries(item.stats).map(([name, counts]) => ({ name, counts })),
    }
    return accumulator
  }, {})
  return { histograms }
}

export async function get_barscores(ui_values) {
  const schemas = await get_schemas()
  const { response: counting_fields } = await fetch_meta_post({
    endpoint: '/schemas/find',
    body: {
      filter: {
        where: {
          'meta.$validator': ui_values.counting_validator,
          'meta.Bar_Score': true,
        },
      },
    },
  })
  //   "where": {
  //     "meta.cited_by_tweeters_count": {"neq": null}
  //   },
  //   "fields": [
  //     "meta.cited_by_tweeters_count",
  //     "meta.tool_name"
  //   ],
  //   "order": "meta.cited_by_tweeters_count DESC",
  //   "limit": 10
  // }
  // {
  const meta_promise = counting_fields.map(async (item) => {
    const { response: meta_scores } = await fetch_meta({
      endpoint: `/${item.meta.Table}`,
      body: {
        depth: 2,
        filter: {
          'where': {
            [item.meta.Order_By]: {
              neq: null,
            },
          },
          'order': `${item.meta.Order_By} DESC`,
          'limit': 25,
        },
      },
    })
    const stats = meta_scores.reduce((accumulator, match) => {
      const count = Number(makeTemplate('${' + item.meta.Order_By + '}', match))
      const name = makeTemplate('${' + item.meta.Field_Name + '}', match)
      accumulator[name] = count
      return accumulator
    }, {}) // TODO: Fix this as schema
    return { meta: item.meta, stats: stats }
  })

  const meta = await Promise.all(meta_promise)
  const barscores = meta.reduce((accumulator, item) => {
    accumulator[item.meta.Preferred_Name || item.meta.Field_Name] = {
      key: item.meta.Preferred_Name || item.meta.Order_By,
      Preferred_Name: item.meta.Preferred_Name || item.meta.Order_By,
      table: item.meta.Table,
      stats: Object.entries(item.stats).map(([name, counts]) => ({ name, counts })),
    }
    return accumulator
  }, {})
  return { barscores }
}

export async function get_resource_signature_count() {
  const schemas = await get_schemas()
  let resource_list
  const { response } = await fetch_meta({
    endpoint: '/resources',
  })

  if (response.length === 0) {
    const { response: libraries } = await fetch_meta({
      endpoint: '/libraries',
    })
    resource_list = libraries
  } else {
    resource_list = response
  }
  let resource_signature_count = []
  for (const resource of resource_list) {
    const resource_id = resource.id
    const schema = findMatchedSchema(resource, schemas)
    const name_props = Object.values(schema.properties).filter((prop) => prop.name)
    let resource_name
    if (name_props.length > 0) {
      resource_name = makeTemplate(name_props[0].text, resource)
    }
    if (name_props.length === 0 || resource_name === 'undefined') {
      console.warn('source of resource name is not defined, using either Resource_Name or ids')
      resource_name = resource.meta['Resource_Name'] || resource_id
    }
    const { response: res } = await fetch_meta({ endpoint: `/resources/${resource_id}/signatures/count` })
    resource_signature_count = [...resource_signature_count, { name: resource_name, counts: res.count }]
  }
  return { resource_signature_count }
}

export async function get_signature_keys() {
  const { response: libraries } = await fetch_meta({
    endpoint: '/libraries',
  })
  const signature_keys_promises = libraries.map(async (lib) => {
    const libid = lib.id
    const { response: fields } = await fetch_meta({
      endpoint: `/libraries/${libid}/signatures/key_count`,
    })
    return {
      id: libid,
      keys: Object.keys(fields),
    }
  })
  const sigkeys = await Promise.all(signature_keys_promises)
  const signature_keys = sigkeys.reduce((keys, sig) => {
    keys[sig.id] = sig.keys
    return keys
  }, {})
  return signature_keys
}
