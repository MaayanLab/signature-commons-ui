import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { withRouter } from "react-router";

import { initGA, logPageView } from '../../util/analytics'
// import { styles } from '../../styles/jss/theme.js'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { useWidth } from '../../util/ui/useWidth'

import dynamic from 'next/dynamic'

const Header = dynamic(()=>import('./Header'));
const Footer = dynamic(()=>import('./Footer'));
const Container = dynamic(()=>import('@material-ui/core/Container'));

const useStyles = makeStyles((theme) => ({
  container: {
    [theme.breakpoints.down('lg')]: {
        width: "80%",
    },
    [theme.breakpoints.up('xl')]: {
      width: "70%",
  }
  },
}));

const Base = (props) => {
  const {
    location,
    ui_values,
    children,
  } = props
  const {pathname} = location
  const [ga_code, setGACode] = useState(undefined)
  const theme = useTheme()
  const width = useWidth()
  const classes = useStyles()

  useEffect(() => {
    const set_code = async () => {
      if (!window.GA_INITIALIZED) {
        const code = await initGA()
        if (code) setGACode(code)
        window.GA_INITIALIZED = true
      }
    }
    set_code()
  });

  useEffect(() => {
    const log = async () => {
      logPageView(pathname, ga_code)
    }
    log()
  }, [ga_code, pathname]);

  const {nav} = ui_values
  const endpoints = []
  for (const i of Object.values(nav)) {
    if (i.type === "iframe"){
      endpoints.push(i.endpoint)
    }
  }
  let maxWidth = width==="xl" ? "lg": "md"
  if (endpoints.indexOf(pathname) > -1) maxWidth = "xl"

  return (
    <div className="root">
      <Head>
        <meta charSet="utf-8" />
        <title>{ui_values.favicon.title}</title>
        <link rel="shortcut icon" alt={ui_values.favicon.alt} href={makeTemplate(ui_values.favicon.src, {})} />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {ui_values.font_families.map((family, ind) => (
          <link href={family} key={ind} rel="stylesheet" type="text/css"/>
        ))}
        <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.9.55/css/materialdesignicons.min.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <script async defer src="https://buttons.github.io/buttons.js"></script>
        {ga_code===undefined && process.env.NODE_ENV === "development"?null:
          <React.Fragment>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${ga_code}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga_code}', {
                  page_path: window.location.pathname,
                });
            `
              }}
            />
          </React.Fragment>
        }
      </Head>
      <Header 
        location={location}
        ui_values={ui_values}
      />
      <main style={{ backgroundColor: theme.palette.background.main }} {...ui_values.background_props}>
        <Container className={classes.container} maxWidth={maxWidth}>
          {children}
        </Container>
      </main>
      <Footer 
        ui_values={ui_values}  
        theme={theme}
      />
    </div>
  )

}

export default withRouter(Base)
