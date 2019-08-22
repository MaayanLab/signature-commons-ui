
import React from 'react'
import App, { Container } from 'next/app'
import { Provider } from "react-redux";
import dynamic from 'next/dynamic'

import Router from 'next/router'
import NProgress from 'nprogress'
import Error from './_error'
import serializeError from 'serialize-error'
import '../styles/index.scss'
import withRedux from "next-redux-wrapper";
import initializeStore from '../util/redux/store'

NProgress.configure({ showSpinner: false })

Router.events.on('routeChangeStart', (url) => NProgress.start())
Router.events.on('hashChangeStart', (url) => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('hashChangeComplete', (url) => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

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
  }

  componentDidCatch(error, errorInfo) {
    // TODO: log error
    NProgress.done()
    this.setState({ error, errorInfo })
  }

  render() {
    const { Component, store } = this.props
    const { pageProps, loaded } = this.state
    if (this.props.errorCode || this.state.error !== undefined) {
      return (
        <Container className="root">
          <Error code={this.props.errorCode} message={serializeError(this.props.error) || this.state.errorMessage} />
        </Container>
      )
    }
    return (
      <Provider store={store}>
        <Container className="root">
          {loaded ? (
              <Component {...pageProps} />
          ) : (
            <div>
              Loading Page...
            </div>
          )}
        </Container>
      </Provider>
    )
  }
}

export default withRedux(initializeStore)(App_);