import fetch from 'isomorphic-unfetch'

export const base_url = process.env.REACT_APP_METADATA_API || (window.location.origin + '/signature-commons-metadata-api')

export async function fetch_meta(endpoint, body, signal, headers) {
  const start = new Date()

  const request = await fetch(
    base_url
    + endpoint
    + (
      (body === undefined) ? '' : (
        '?'
        + Object.keys(body).reduce(
          (params, param) => ([
            ...params,
            encodeURIComponent(param)
              + '='
              + encodeURIComponent(JSON.stringify(body[param]))
          ]), []
        ).join('&')
      )
    ),
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // 'Authorization': auth,
        ...(headers || {}),
      },
      signal: signal,
    }
  )
  const response = await request.json()

  let contentRange = request.headers.get('Content-Range')
  if (contentRange !== null) {
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

export async function fetch_meta_post(endpoint, body, signal) {
  const start = new Date()
  const request = await fetch(
    base_url + endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // 'Authorization': auth,
      },
      signal: signal,
    }
  )
  const response = await request.json()

  let contentRange = request.headers.get('Content-Range')
  if (contentRange !== null) {
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
