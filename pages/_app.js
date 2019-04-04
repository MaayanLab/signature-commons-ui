
import React from 'react'
import App, { Container } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import '../styles/index.scss'

NProgress.configure({ showSpinner: false });

Router.events.on('routeChangeStart', url => NProgress.start())
Router.events.on('hashChangeStart', url => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('hashChangeComplete', url => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export default class extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <Container className="root">
        <Component {...pageProps} />
      </Container>
    )
  }
}