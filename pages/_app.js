
import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'
import '../styles/index.scss'

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
        <Head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="favicon.ico" />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
          <script async defer src="https://buttons.github.io/buttons.js"></script>
        </Head>
        <Component {...pageProps} />
      </Container>
    )
  }
}
