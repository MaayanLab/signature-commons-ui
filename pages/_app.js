
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

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  constructor(props) {
    super(props)
    this.state = {
      error: undefined,
      errorInfo: undefined,
    }
  }

  componentDidCatch(error, errorInfo) {
    // TODO: log error
    NProgress.done()
    this.setState({ error, errorInfo })
  }

  render() {
    const { Component, pageProps } = this.props

    if (this.props.errorCode || this.state.error !== undefined) {
      return (
        <Container className="root">
          <Error code={this.props.errorCode} message={serializeError(this.props.error)} />
        </Container>
      )
    }

    return (
      <Container className="root">
        <Component {...pageProps} />
      </Container>
    )
  }
}
