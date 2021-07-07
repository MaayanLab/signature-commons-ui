import React from 'react'
import dynamic from 'next/dynamic'
import { get_initial_props, get_theme, getSummary } from '../util/ui/fetch_ui_props'
import { MuiThemeProvider } from '@material-ui/core'
import {DataResolver} from '../connector'
import { getResourcesAndLibraries } from '../util/ui/getResourcesAndLibraries'


const Router = dynamic(async () => (await import('react-router-dom')).HashRouter, { ssr: false })
const Route = dynamic(async () => (await import('react-router-dom')).Route, { ssr: false })
const Home = dynamic(() => import('../components/Home'), { ssr: false })


export async function getStaticProps(context) {
  const { ui_values, theme_mod, schemas } = await get_initial_props()
  const resolver = new DataResolver([], true)
  const resource_libraries = await getResourcesAndLibraries(schemas, resolver)
  const stats = await getSummary()
  return {
    props: {
      ui_values,
      theme_mod,
      schemas,
      resource_libraries,
      stats,
    }, // will be passed to the page component as props
    revalidate: 60
  }
}
class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      theme: null,
      ui_values: null,
      schemas: null,
    }
  }
  // static async getInitialProps() {

  // }

  render() {
    const theme = get_theme(this.props.theme_mod)
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <div className="root">
            <Route path="/" render={(props) => <Home 
              {...props}
              theme={theme}
              {...this.props}/>} 
            />
          </div>
        </Router>
      </MuiThemeProvider>
    )
  }
}

export default App
