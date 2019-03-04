const withSass = require('@zeit/next-sass')
const nextBuildId = require('next-build-id')

module.exports = withSass({
  assetPrefix: process.env['PREFIX'] || '',
  exportPathMap: async (defaultPathMap) => {
    return {...defaultPathMap}
  },
  generateBuildId: async () => {
    const fromGit = await nextBuildId({ dir: __dirname })
    return fromGit.id
  },
  env: {
    PREFIX: process.env['PREFIX'] || '',
    REACT_APP_METADATA_API: process.env.REACT_APP_METADATA_API,
    REACT_APP_DATA_API: process.env.REACT_APP_DATA_API,
  },
})
