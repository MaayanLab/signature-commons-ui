const base_url = 'https://amp.pharm.mssm.edu/enrichmentapi/api/enrich'

export async function fetch_enrich(body) {
  return JSON.parse(
    await (
      await fetch(
        base_url,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      )
    ).text()
  )
}
