import fetch from 'isomorphic-unfetch'
import config from '../config'

export async function get_base_url() {
  return (await config()).NEXT_PUBLIC_EXTERNAL_API
}

export async function fetch_external({ endpoint, body, signal, headers }) {
  const start = new Date()
  let duration
  const base_url = await get_base_url()
  if (base_url === undefined) {
    duration = (new Date() - start) / 1000
    return {
      response: {},
      duration,
    }
  }

  const request = await fetch(
      base_url
        + (endpoint === undefined ? '' : endpoint)
        + (body === undefined ? '' : '?' + body),
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
    throw new Error(`Error communicating with API at ${base_url}${endpoint}`)
  }
  const response = await request.json()
  duration = request.headers.get('X-Duration')
  if (duration !== null) {
    duration = Number(request.headers.get('X-Duration'))
  } else {
    duration = (new Date() - start) / 1000
  }
  return { response, duration }
}


export async function fetch_external_post({ endpoint, body, signal, headers }) {
  const start = new Date()
  let duration
  const base_url = await get_base_url()
  if (base_url === undefined) {
    duration = (new Date() - start) / 1000
    return {
      response: {},
      duration,
    }
  }

  const request = await fetch(
      base_url
        + (endpoint === undefined ? '' : endpoint),
      {
        method: 'POST',
        body: JSON.stringify(body),
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
    throw new Error(`Error communicating with API at ${base_url}${endpoint}`)
  }
  const response = await request.json()
  duration = request.headers.get('X-Duration')
  if (duration !== null) {
    duration = Number(request.headers.get('X-Duration'))
  } else {
    duration = (new Date() - start) / 1000
  }
  return { response, duration }
}
