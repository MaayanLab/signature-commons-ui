const base_url = process.env.REACT_APP_DATA_API || '/enrichmentapi/api'

export async function fetch_data(endpoint, body, signal) {
  try {
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
  } catch(e) {
    return {"signatures": [], "matchingEntities": [], "queryTimeSec": 0, "results": {}}
  }
}
