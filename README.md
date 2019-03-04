# signature-commons-ui
A front-end UI for demoing API integration. Currently available at: http://amp.pharm.mssm.edu/sigcom/

## Development
Before starting, install the project dependencies:

```bash
npm install
```

You'll also want to configure the prefix. To just use the production API use:
```bash
source .env.development
```

### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run export:[dev|production]`
Build and export the project as a series of .html files.

### `npm run deploy:[dev|production]`
Export, build and deploy the docker image for release.
