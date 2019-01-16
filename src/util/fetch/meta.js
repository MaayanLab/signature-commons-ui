export const base_url = process.env.REACT_APP_METADATA_API || '/signature-commons-metadata-api'

export async function fetch_meta(endpoint, body, signal) {
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
      },
      signal: signal,
    }
  )
  const response = await request.json()
  // NOTE: Currently the headers are not accessible
  return {
    response,
    duration: request.headers['X-Duration'] || ((new Date() - start)/1000),
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
  // NOTE: Currently the headers are not accessible
  return {
    response,
    duration: request.headers['X-Duration'] || ((new Date() - start)/1000),
  }
}
