import React from 'react'
import Insignia from '../src/index'
import { TextField } from '@material-ui/core'

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
    return (
      <div>
        <Insignia {...this.state} />
        <br/>
        <input type="text" id="url" name="fname" value={this.state.params.url} onChange={(e)=>this.setState({params: {url: e.target.value}})}></input>
      </div>
    )
  }
}
