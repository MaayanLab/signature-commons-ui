
import React from 'react'
import App from 'next/app'
import CircularProgress from '@material-ui/core/CircularProgress'

import Error from './_error'
import serializeError from 'serialize-error'
import '../styles/index.scss'
import CssBaseline from '@material-ui/core/CssBaseline'

class App_ extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (process.env.NODE_ENV === 'production' && Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps, loaded: true }
  }

  constructor(props) {
    super(props)
    this.state = {
      error: undefined,
      errorInfo: undefined,
      loaded: false,
      pageProps: {},
    }
  }

  async componentDidMount() {
    let { Component, pageProps } = this.props
    if (process.env.NODE_ENV === 'development' && Component.getInitialProps && !this.state.loaded) {
      pageProps = await Component.getInitialProps()
    }
    if (pageProps !== undefined) {
      if (pageProps.error) {
        this.setState({
          error: 'error',
          errorMessage: pageProps.error,
        })
      } else {
        this.setState({
          pageProps,
          loaded: true,
        })
      }
    } else {
      this.setState({
        loaded: true,
      })
    }
  }

  componentDidCatch(error, errorInfo) {
    // TODO: log error
    this.setState({ error, errorInfo })
  }

  render() {
    const { Component, store } = this.props
    const { pageProps, loaded } = this.state
    if (this.props.errorCode || this.state.error !== undefined) {
      return (
        <Error code={this.props.errorCode} message={serializeError(this.props.error) || this.state.errorMessage} />
      )
    }
    return (
      <div className="root">
        <CssBaseline />
        {loaded ? (
            <Component {...pageProps} />
        ) : (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <CircularProgress />
          </div>
        )}
      </div>
    )
  }
}

export default App_
