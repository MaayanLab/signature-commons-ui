const base_url = process.env.REACT_APP_DATA_API || '/enrichmentapi/api'

export async function fetch_data(endpoint, body, signal) {
  try {
    const request = await fetch(
      base_url + endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal: signal,
      }
    )
    const response = JSON.parse(await request.text())
    return {
      duration: response.queryTimeSec,
      response
    }
  } catch(e) {
    return {
      duration: Infinity,
      response: {
        "signatures": [], "matchingEntities": [], "queryTimeSec": 0, "results": {}
      }
    }
  }
}
