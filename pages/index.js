import React from 'react'
import dynamic from 'next/dynamic'
import CircularProgress from '@material-ui/core/CircularProgress'
import { get_initial_props } from '../util/ui/fetch_ui_props'
import { MuiThemeProvider } from '@material-ui/core'

const Router = dynamic(async () => (await import('react-router-dom')).HashRouter, { ssr: false })
const Route = dynamic(async () => (await import('react-router-dom')).Route, { ssr: false })
const Home = dynamic(() => import('../components/Home'), { ssr: false })

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      theme: null,
      ui_values: null,
    }
  }
  static async getInitialProps() {

  }

  componentDidMount = async () => {
    const { ui_values, theme_mod } = await get_initial_props()
  }

  render() {
    if (!this.state.theme === null) {
      return <div style={{ textAlign: 'center', marginTop: 100 }}>
        <CircularProgress />
      </div>
    }
    return (
      <MuiThemeProvider theme={this.props.theme}>
        <Router>
          <div className="root">
            <Route path="/" render={(props) => <Home {...props}/>} />
          </div>
        </Router>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
