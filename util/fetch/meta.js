import fetch from 'isomorphic-unfetch'
import config from '../config'

export async function base_url() {
  return (await config()).NEXT_PUBLIC_METADATA_API
}

export async function base_scheme() {
  return /^(https?):\/\/.+/.exec(await base_url())[1]
}

export async function fetch_creds({ endpoint, body, signal, headers }) {
  const request = await fetch(
      (await base_url())
    + (endpoint === undefined ? '' : endpoint)
    + (body === undefined ? '' : (
        '?'
        + Object.keys(body).reduce(
            (params, param) => ([
              ...params,
              encodeURIComponent(param)
              + '='
              + encodeURIComponent(JSON.stringify(body[param])),
            ]), []
        ).join('&')
      )),
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
  if (request.ok) {
    return {
      authenticated: true,
    }
  } else {
    return {
      authenticated: false,
    }
  }
}


export async function fetch_meta({ endpoint, body, signal, headers }) {
  const start = new Date()

  const request = await fetch(
      (await base_url())
    + (endpoint === undefined ? '' : endpoint)
    + (body === undefined ? '' : (
        '?'
        + Object.keys(body).reduce(
            (params, param) => ([
              ...params,
              encodeURIComponent(param)
              + '='
              + encodeURIComponent(JSON.stringify(body[param])),
            ]), []
        ).join('&')
      )),
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
  if (request.ok !== true) {
    throw new Error(`Error communicating with API at ${await base_url()}${endpoint}`)
  }

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

export async function fetch_meta_post({ endpoint, body, signal }) {
  const start = new Date()
  const request = await fetch(
      (await base_url())
    + (endpoint === undefined ? '' : endpoint),
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
  if (request.ok !== true) {
    throw new Error(`Error communicating with API at ${await base_url()}${endpoint}`)
  }

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
