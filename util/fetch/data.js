import fetch from 'isomorphic-unfetch'

export const base_url = process.env.NEXT_SERVER_DATA_API
  || process.env.NEXT_STATIC_DATA_API
  || process.env.NEXT_PUBLIC_DATA_API
  || (window.location.origin + '/enrichmentapi/api/v1')

export async function fetch_data({ endpoint, body, signal }) {
  const start = new Date()

  const request = await fetch(
      base_url
    + (endpoint === undefined ? '' : endpoint),
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal: signal,
      }
  )
  if (request.ok !== true) {
    throw new Error(`Error communicating with API at ${base_url}${endpoint}`)
  }

  let response_text = await request.text()
  if (response_text === '') { // normalize empty responses
    response_text = '{"signatures":[], "matchingEntities": [], "results": {}}'
  }

  const response = JSON.parse(response_text)

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
