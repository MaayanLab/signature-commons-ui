# signature-commons-ui
A front-end UI for demoing API integration. Currently available at: http://amp.pharm.mssm.edu/sigcom/

## Development
Before starting, install the project dependencies:

```bash
npm install
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

## dotenv
We use dotenv / next-dotenv to organize loading of environment variables--more specific settings will override less specific ones. i.e. `.env.development` settings take precedent over `.env`. You should define your own `.env.*.local` which are hidden by git (see [dotenv-load](https://github.com/formatlos/dotenv-load)).

Furthermore, environment prefixes are important for NextJS.

- `NEXT_PUBLIC_*`: available server / client side
- `NEXT_SERVER_*`: available server side only
- `NEXT_STATIC_*`: available during static rendering

Other variables may not propagate, so ensure you use these prefixes.

## UI SCHEMAS
Modifying SigCom UI to your data is done via the entries in the schema table. SigCom uses three types of schemas.

- `/dcic/signature-commons-schema/v5/meta/schema/landing-ui.json`: Defines the overall look of the landing page
- `/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json`: Used for formatting the labels for searches, without this, SigCom defaults to the ids as labels
- `/dcic/signature-commons-schema/v5/meta/schema/counting.json`: Tells sigcom which metadata to count for the landing page, you can also set it to either be a pie chart, a bar chart, or a regular count|

For more information check [Modifying UI](./components/Landing/README.md)
and the [examples folder](./examples/). Also, check [UI_values](./util/ui_values.js)