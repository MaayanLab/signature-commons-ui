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
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2
  },
})
