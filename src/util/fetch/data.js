const base_url = 'https://amp.pharm.mssm.edu/enrichmentapi/api'

export async function fetch_enrich(body, signal) {
  return JSON.parse(
    await (
      await fetch(
        base_url + '/enrich',
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
