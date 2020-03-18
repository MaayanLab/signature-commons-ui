var shell = require('shelljs')
var process = require('process')
var packageJson = require('../package.json')

if (
  shell.exec(`
    docker build \
      -t ${process.env.DOCKER_TAG}:${packageJson.version} \
      .
  `).code !== 0
) {
  shell.echo('Error: Docker build failed')
  shell.exit(1)
}
