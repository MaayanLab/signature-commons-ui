const withSass = require('@zeit/next-sass')
const nextBuildId = require('next-build-id')

module.exports = withSass({
  target: (process.env['SERVERLESS'] && 'serverless') || undefined,
  assetPrefix: process.env['PREFIX'] || '',
  exportPathMap: async (defaultPathMap) => {
    return {...defaultPathMap}
  },
  generateBuildId: async () => {
    const fromGit = await nextBuildId({ dir: __dirname })
    return fromGit.id
  },
  env: {
    PREFIX: process.env['PREFIX'],
    STATIC_PREFIX: (process.env['PREFIX'] || '') + '/static',
    REACT_APP_METADATA_API: process.env.REACT_APP_METADATA_API,
    REACT_APP_DATA_API: process.env.REACT_APP_DATA_API,
  },
})
