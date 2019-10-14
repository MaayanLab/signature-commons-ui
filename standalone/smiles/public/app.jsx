import React from 'react'
import SmilesCanvas from '../src/index'

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
    }
  }

  set_state_evt = (key) => (evt) => this.setState({ [key]: evt.target.value })

  render = () => (
    <div>
      <SmilesCanvas
        smiles={this.state.smiles}
        width={1000}
        height={400}
      />
      <input
        type="text"
        value={this.state.smiles}
        onChange={this.set_state_evt('smiles')}
      />
    </div>
  )
}

export default App
