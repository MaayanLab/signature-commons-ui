let _config = undefined

export default async function config() {
  try {
    if (_config === undefined) {
      _config = await (await fetch('./static/config.json')).json()
    }
    return _config
  } catch {
    console.warn('Could not load config, using fallback')
    return {
      NEXT_PUBLIC_METADATA_API: process.env.NEXT_PUBLIC_METADATA_API !== undefined ? process.env.NEXT_PUBLIC_METADATA_API : (window.location.origin + '/signature-commons-metadata-api'),
      NEXT_PUBLIC_DATA_API: process.env.NEXT_PUBLIC_DATA_API !== undefined ? process.env.NEXT_PUBLIC_DATA_API : (window.location.origin + '/enrichmentapi'),
      NEXT_PUBLIC_ENRICHR_URL: process.env.NEXT_PUBLIC_ENRICHR_URL === undefined ? 'https://amp.pharm.mssm.edu/Enrichr' : process.env.NEXT_PUBLIC_ENRICHR_URL,
      NEXT_PUBLIC_EXTERNAL_API: process.env.NEXT_PUBLIC_EXTERNAL_API === undefined ? 'https://amp.pharm.mssm.edu/isitup' : process.env.NEXT_PUBLIC_EXTERNAL_API,
    }
  }
}
