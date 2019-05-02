import React from 'react'

const statusCodes = {
  400: 'Bad Request',
  404: 'This page could not be found',
  500: 'Internal Server Error',
  501: 'Not Implemented',
}

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode }
  }

  render() {
    let title = 'Unknown Error'
    if (this.props.code) {
      if (statusCodes[this.props.code]) {
        title = `${statusCodes[props.code]} (${props.code})`
      } else {
        title = `${props.code}`
      }
    }
    return (
      <div>
        <h1>{title}</h1>
        <h2>{this.props.message}</h2>
      </div>
    )
  }
}
