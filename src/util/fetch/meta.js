const base_url = 'http://amp.pharm.mssm.edu/signature-commons-metadata-api'
// const auth = 'Basic ' + Buffer.from(
//   process.env['ADMIN_USERNAME']
//   + ':'
//   + process.env['ADMIN_PASSWORD']
// ).toString('base64')

export async function fetch_meta(endpoint, body, signal) {
  return await (
    await fetch(
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
  ).json()
}

export async function fetch_meta_post(endpoint, body, signal) {
  return await (
    await fetch(
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
  ).json()
}
