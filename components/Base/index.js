import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default class extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      M: undefined,
    }
  }

  async componentDidMount() {
    const M = await import('materialize-css')
    this.setState({ M }, () => this.state.M.AutoInit())
  }

  componentDidUpdate() {
    if (this.state.M !== undefined) {
      this.state.M.AutoInit();
      this.state.M.updateTextFields();
    }
  }

  render() {
    return (
      <div className="root">
        <Header />
        <main>
          <div className="container">
            {this.props.children}
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
