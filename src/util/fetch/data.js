const base_url = process.env.REACT_APP_DATA_API || (window.location.origin + '/enrichmentapi/api')

export async function fetch_data(endpoint, body, signal) {
  try {
    const start = new Date()

    const request = await fetch(
      base_url + endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal: signal,
      }
    )
    const response = JSON.parse(await request.text())
  
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
  } catch(e) {
    return {
      duration: Infinity,
      response: {
        "signatures": [], "matchingEntities": [], "results": {}
      }
    }
  }
}
