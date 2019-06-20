import React from 'react'
import IconButton from '../../components/IconButton'
import { call } from '../../util/call'
import ShowMeta from '../../components/ShowMeta'
import { Label } from '../../components/Label'
import { Link } from 'react-router-dom'
import M from 'materialize-css'

export default class ResourcePage extends React.Component {
  componentDidMount() {
    M.AutoInit()
  }

  redirectLink(url) {
    return (e) => window.open(url, '_blank').focus()
  }

  render() {
    return (
      <div className="row">
        <div className="col s12">

          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="row">
                  <div className="col s12">
                    <div className="card-image col s1">
                      <IconButton
                        img={this.props.resource.meta.icon}
                        onClick={call(this.redirectLink, this.props.resource.meta.URL)}
                      />
                    </div>
                    <div className="card-content col s11">
                      <div>
                        <span className="card-title">{this.props.resource.meta.name}</span>
                      </div>
                      {Object.keys(this.props.resource.meta).filter((key) => (['name', 'icon'].indexOf(key) === -1)).map((key) => (
                        <div key={key}>
                          <span>
                            <b>{key.replace(/_/g, ' ')}:</b>&nbsp;
                            {this.props.resource.meta[key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-action">
                  <Link
                    to={`/${this.props.ui_content.content.change_resource || 'Resources'}`}
                    className="waves-effect waves-teal btn-flat"
                  >
                    BACK
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {!this.props.resource.is_library?
            <div className="row">
              <div className="col s12">
                <ul
                  className="collapsible popout"
                >
                  {this.props.resource.libraries.map((library) => (
                    <li
                      key={library.id}
                    >
                      <div
                        className="page-header"
                        style={{
                          padding: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: 'rgba(255,255,255,1)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                          }}>
                          <Label
                            item={library}
                            visibility={1}
                          />
                          &nbsp;
                          <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                          <a
                            href="javascript:void(0);"
                            className="collapsible-header"
                            style={{ border: 0 }}
                          >
                            <i className="material-icons">expand_more</i>
                          </a>
                        </div>
                      </div>
                      <div
                        className="collapsible-body"
                      >
                        <ShowMeta
                          value={{
                            '@id': library.id,
                            '@type': 'Library',
                            'meta': library.meta,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div> :
            null
          }
        </div>
      </div>
    )
  }
}
