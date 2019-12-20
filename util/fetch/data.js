import fetch from 'isomorphic-unfetch'

export const base_url = process.env.NEXT_SERVER_DATA_API
  || process.env.NEXT_STATIC_DATA_API
  || process.env.NEXT_PUBLIC_DATA_API
  || (window.location.origin + '/enrichmentapi')

export const base_versioned_url = base_url + '/api/v1'

export async function fetch_data({ endpoint, body, signal }) {
  const start = new Date()

  const request = await fetch(
      base_versioned_url
    + (endpoint === undefined ? '' : endpoint),
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal: signal,
      }
  )
  if (request.ok !== true) {
    throw new Error(`Error communicating with API at ${base_versioned_url}${endpoint}`)
  }

  let response_text = (await request.text()).replace(/Infinity/g, 'null')
  if (response_text === '') { // normalize empty responses
    response_text = '{"signatures":[], "matchingEntities": [], "results": {}}'
  }
  let response
  try {
    response = JSON.parse(response_text)
  } catch (e) {
    console.error(e)
  }
  let contentRange = request.headers.get('Content-Range')
  if (contentRange !== null && !contentRange.startsWith('-')) {
    const contentRangeMatch = /^(\d+)-(\d+)\/(\d+)$/.exec(contentRange)
    contentRange = {
      start: Number(contentRangeMatch[1]),
      end: Number(contentRangeMatch[2]),
      count: Number(contentRangeMatch[3]),
    }
  }

  let duration = request.headers.get('X-Duration')
  if (duration !== null) {
    duration = Number(request.headers.get('X-Duration'))
  } else {
    duration = (new Date() - start) / 1000
  }

  return {
    response,
    contentRange,
    duration,
  }
}
