import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

export default class Lazy extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      children: <div style={{textAlign: "center"}}><CircularProgress/></div>,
    }
  }

  async componentDidMount() {
    this.setState({
      children: await this.props.children(),
    })
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.reloader !== this.props.reloader){
      this.setState({
        children: await this.props.children(),
      })
    }
  }

  render = () => this.state.children
}
