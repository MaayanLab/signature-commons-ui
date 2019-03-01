const withSass = require('@zeit/next-sass')
const nextBuildId = require('next-build-id')
module.exports = withSass({
  target: 'serverless',
  assetPrefix: process.env['PREFIX'] || '/sigcom',
  exportPathMap: async (defaultPathMap) => {
    return {...defaultPathMap}
  },
  generateBuildId: async () => {
    const fromGit = await nextBuildId({ dir: __dirname })
    return fromGit.id
  },
})