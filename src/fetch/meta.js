const base_url = 'http://amp.pharm.mssm.edu/signature-commons-metadata-api'
// const auth = 'Basic ' + Buffer.from(
//   process.env['ADMIN_USERNAME']
//   + ':'
//   + process.env['ADMIN_PASSWORD']
// ).toString('base64')

export async function fetch_meta(endpoint, body) {
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
                + encodeURIComponent(body[param])
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
      }
    )
  ).json()
}
