import React from 'react'
import SmilesDrawer from 'smiles-drawer'
import PropTypes from 'prop-types'

/*
Note--It's known that after errors rendering happens twice, but it
 shouldn't matter too much since errors are not the anticipated use case.
*/
export class SmilesCanvas extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ref: null,
      error: '',
    }
  }

  get_ref = (ref) => {
    if (ref !== this.state.ref) {
      this.setState({ ref })
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    this.draw()
  }

  draw = async () => {
    if (this.state.ref === null) return

    const { width, height, smiles, themeName, infoOnly } = this.props
    const smilesDrawer = new SmilesDrawer.Drawer({ width, height })
    let tree
    let error = ''
    try {
      tree = await new Promise((resolve, reject) =>
        SmilesDrawer.parse(smiles, (tree) => resolve(tree), (err) => reject(err))
      )
    } catch (e) {
      error = e + ''
    }
    if (this.state.error !== error) {
      this.setState({ error }, () => {
        if (!error) {
          smilesDrawer.draw(tree, this.state.ref, themeName, infoOnly)
        }
      })
    } else if (!error) {
      smilesDrawer.draw(tree, this.state.ref, themeName, infoOnly)
    }
  }

  render = () => (
    <div>
      <canvas
        ref={this.get_ref}
        style={{
          width: this.props.width,
          height: this.props.height,
          display: this.state.error ? 'none' : 'table-cell',
        }}
      ></canvas>
      <div
        style={{
          width: this.props.width,
          height: this.props.height,
          display: this.state.error ? 'table-cell' : 'none',
          textAlign: 'center',
          verticalAlign: 'middle',
          color: 'darkred',
          fontWeight: 'bold',
        }}
      >
        {this.state.error + ''}
      </div>
    </div>
  )
}

SmilesCanvas.propTypes = {
  smiles: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  themeName: PropTypes.string,
  infoOnly: PropTypes.bool,
}

export default SmilesCanvas
