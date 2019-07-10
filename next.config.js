const withSass = require('@zeit/next-sass')
const nextBuildId = require('next-build-id')
const nextEnv = require('next-env')
const dotenvLoad = require('dotenv-load')

dotenvLoad()
const withNextEnv = nextEnv()

const PREFIX = process.env.NEXT_EXPORT ? (process.env.PREFIX || '') : ''

module.exports = withNextEnv(withSass({
  assetPrefix: PREFIX,
  exportPathMap: async (defaultPathMap) => {
    return { ...defaultPathMap }
  },
  generateBuildId: async () => {
    const fromGit = await nextBuildId({ dir: __dirname })
    return fromGit.id
  },
  env: {
    PREFIX,
  },
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 1200 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
}))
