
import React from 'react'
import App, { Container } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import Error from './_error'
import serializeError from 'serialize-error'
import '../styles/index.scss'

NProgress.configure({ showSpinner: false })

Router.events.on('routeChangeStart', (url) => NProgress.start())
Router.events.on('hashChangeStart', (url) => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('hashChangeComplete', (url) => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export default class extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (process.env.NODE_ENV === 'production' && Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }

  constructor(props) {
    super(props)
    this.state = {
      error: undefined,
      errorInfo: undefined,
      pageProps: {},
    }
  }

  async componentDidMount() {
    let { Component, pageProps } = this.props
    if (process.env.NODE_ENV === 'development' && Object.keys(pageProps).length === 0) {
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
      })
    }
  }

  componentDidCatch(error, errorInfo) {
    // TODO: log error
    NProgress.done()
    this.setState({ error, errorInfo })
  }

  render() {
    const { Component } = this.props
    const { pageProps } = this.state
    if (this.props.errorCode || this.state.error !== undefined) {
      return (
        <Container className="root">
          <Error code={this.props.errorCode} message={serializeError(this.props.error) || this.state.errorMessage} />
        </Container>
      )
    }
    return (
      <Container className="root">
        { Object.keys(pageProps).length > 0 ?
        <Component {...pageProps} /> :
        <div>
        Loading Page...
        </div>
        }
      </Container>
    )
  }
}
