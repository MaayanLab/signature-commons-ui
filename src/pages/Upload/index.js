import React from 'react';
import { parse_file } from '../../util/parse'

export default class Upload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: '',
      parsed: undefined,
    }

    this.get_file = this.get_file.bind(this)
  }

  get_file(e) {
    try {
      const loader = new FileReader()
      loader.onload = (evt) => {
        if(evt.target.readyState !== 2) return
        if(evt.target.error) throw new Error(evt.target.error)
        this.setState({
          file: evt.target.result
        }, this.process)
      }
      loader.readAsText(e.target.files[0])
    } catch(e) {
    }
  }

  process() {
    try {
      this.setState({
        parsed: JSON.stringify([...parse_file(this.state.file)])
      })
    } catch(e) {
      console.error(e)
    }
  }

  render() {
    return (
      <main id={this.props.id}>
        <div className="row">
          <div className="col s12">
            <form action="#">
              <div className="file-field input-field">
                <div className="btn">
                  <span>CSV</span>
                  <input
                    type="file"
                    onChange={this.get_file}
                  />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text" />
                </div>
              </div>
            </form>
            <div className="col s12">
              <textarea
                value={this.state.file}
                readOnly
              />
            </div>
            <div className="col s12">
              <textarea
                value={this.state.parsed}
                readOnly
              />
            </div>
          </div>
        </div>
      </main>
    )
  }
}
