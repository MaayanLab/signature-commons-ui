import React from 'react';
import { Set } from 'immutable'

function transpose(a) {
  return Object.keys(a[0]).map(function(c) {
      return a.map(function(r) { return r[c]; });
  });
}

export default class Upload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: '',
      value_sets: '',
      type_sets: '',
    }
    this.get_file = this.get_file.bind(this)
  }

  get_file(file) {
    try {
      const loader = new FileReader()
      loader.onload = (evt) => {
        if(evt.target.readyState !== 2) return
        if(evt.target.error) throw new Error(evt.target.error)
        this.setState({
          file: evt.target.result
        }, this.process)
      }
      loader.readAsText(file)
    } catch(e) {
    }
  }

  process() {
    try {
      const parsed = this.state.file.split(/[\n\r]/).map((line) => { console.log(line); return JSON.parse("[" + line + "]")})
      const header = parsed[0]
      const obj = transpose(parsed.slice(1)).reduce((obj, body, ind) => ({...obj, [header[ind]]: body}), {})
      const value_sets = Object.values(obj).map((vals) => { console.log(vals); return Set(vals)})
      const type_sets = value_sets.map((vals) => vals.map((val) => typeof(val)+''))
      this.setState({
        value_sets: JSON.stringify([...value_sets]),
        type_sets: JSON.stringify([...type_sets]),
      })
    } catch(e) {
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
                    onChange={(e) => this.get_file(e.target.files[0])}
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
            <div className="col s6">
              <textarea
                value={this.state.value_sets}
                readOnly
              />
            </div>
            <div className="col s6">
              <textarea
                value={this.state.type_sets}
                readOnly
              />
            </div>
          </div>
        </div>
      </main>
    )
  }
}
