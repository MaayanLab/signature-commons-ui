import React from 'react'
import Insignia from '../src/index'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      params: {
        url: 'https://wormbase.org'
      }
    }
  }

  render = () => {
    return <Insignia {...this.state} />
  }
}
