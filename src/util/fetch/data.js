const base_url = 'https://amp.pharm.mssm.edu/enrichmentapi/api'

export async function fetch_enrich(endpoint, body, signal) {
  return JSON.parse(
    await (
      await fetch(
        base_url + endpoint,
        {
          method: 'POST',
          body: JSON.stringify(body),
          signal: signal,
        }
      )
    ).text()
  )
}

export async function fetch_data(id, signal) {
  return JSON.parse(
    await (
      await fetch(
        base_url + '/' + id,
        {
          method: 'GET',
          signal: signal,
        }
      )
    ).text()
  )
}
