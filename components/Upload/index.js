import React from 'react'
import { parse_file } from '../../util/parse'
import M from 'materialize-css'

export default class Upload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      file: '',
      parsed: '',
    }
  }

  componentDidMount = () => {
    M.AutoInit()
  }

  get_file = (e) => {
    try {
      const loader = new FileReader()
      loader.onload = (evt) => {
        if (evt.target.readyState !== 2) return
        if (evt.target.error) throw new Error(evt.target.error)
        this.setState({
          file: evt.target.result,
        }, this.process)
      }
      loader.readAsText(e.target.files[0])
    } catch (e) {
    }
  }

  process = () => {
    try {
      this.setState({
        parsed: JSON.stringify([...parse_file(this.state.file)]),
      })
    } catch (e) {
      console.error(e)
    }
  }

  render = () => {
    return (
      <main id={this.props.id}>
        <style jsx>{`
        h4 {
          margin: 0px;
        }
        `}</style>
        <div className="row">
          <div className="col s12">
            <ul className="collapsible popout">
              <li className="active white">
                <h4 className="collapsible-header">Upload New Library of Signatures</h4>
                <form action="#" className="collapsible-body">
                  <div className="col s6">
                    <p>
                      Attach a spreadsheet exported as a comma separated vector file (.csv) of the form described to the right.
                      Row and column headers will be paired with the row and column values to form metadata.
                    </p>
                  </div>
                  <div className="col s6">
                    <table>
                      <tbody>
                        <tr><td>&nbsp;       </td><td>&nbsp;       </td><td>Column Label 1  </td><td>Col Value 1  </td><td>...   </td></tr>
                        <tr><td>&nbsp;       </td><td>&nbsp;       </td><td>Column Label 2  </td><td>Col Value 2  </td><td>...   </td></tr>
                        <tr><td>&nbsp;       </td><td>&nbsp;       </td><td>Column Label ...</td><td>Col Value ...</td><td>...   </td></tr>
                        <tr><td>Row Label 1  </td><td>Row Label 2  </td><td>Row Label ...   </td><td>&nbsp;       </td><td>&nbsp;</td></tr>
                        <tr><td>Row Value 1  </td><td>Row Value 2  </td><td>Row Value ...   </td><td>1            </td><td>-1    </td></tr>
                        <tr><td>Row Value ...</td><td>Row Value ...</td><td>Row Value ...   </td><td>0.2          </td><td>...   </td></tr>
                      </tbody>
                    </table>
                  </div>
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
                {this.state.file === '' ? null : (
                  <div className="col s6">
                    <textarea
                      value={this.state.file}
                      readOnly
                    />
                  </div>
                )}
                {this.state.parsed === '' ? null : (
                  <div className="col s6">
                    <textarea
                      value={this.state.parsed}
                      readOnly
                    />
                  </div>
                )}
              </li>
              <li className="white">
                <h4 className="collapsible-header">Upload New Resource</h4>
                <form action="#" className="collapsible-body">
                  Coming soon...
                </form>
              </li>
              <li className="white">
                <h4 className="collapsible-header">Upload Background</h4>
                <form action="#" className="collapsible-body">
                  Coming soon...
                </form>
              </li>
            </ul>
          </div>
        </div>
      </main>
    )
  }
}
