import React from 'react'

export default class Lazy extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      children: null,
    }
  }

  async componentDidMount() {
    this.setState({
      children: await this.props.children(),
    })
  }

  render = () => this.state.children
}
