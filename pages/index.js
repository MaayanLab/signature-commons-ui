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
      schemas: null,
    }
  }
  static async getInitialProps() {

  }

  componentDidMount = async () => {
    const response = await get_initial_props()
    this.setState({
      ...response
    })
  }

  render() {
    if (this.state.theme === null) {
      return <div style={{ textAlign: 'center', marginTop: 100 }}>
        <CircularProgress />
      </div>
    }
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <Router>
          <div className="root">
            <Route path="/" render={(props) => <Home 
              {...props}
              {...this.state}/>} 
            />
          </div>
        </Router>
      </MuiThemeProvider>
    )
  }
}

export default App
