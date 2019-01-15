# signature-commons-ui
A front-end UI for demoing API integration. Currently available at: http://amp.pharm.mssm.edu/sigcomm/

## Development

Before starting, install the project dependencies:

```bash
# Install project dependency
npm install
# Install react development dependency globally
npm install -g react-scripts
```

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Deployment
After running `npm run build`, build and push the docker image:
```bash
docker build -t maayanlab/signature-commons-ui:${version} .
docker push maayanlab/signature-commons-ui:${version}
```
