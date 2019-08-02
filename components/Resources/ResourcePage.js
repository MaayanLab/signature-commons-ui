import React from 'react'
import dynamic from 'next/dynamic'
import IconButton from '../../components/IconButton'
import { call } from '../../util/call'
import ShowMeta from '../../components/ShowMeta'
import { Label } from '../../components/Label'
import { Link } from 'react-router-dom'
import M from 'materialize-css'
import NProgress from 'nprogress'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { makeTemplate } from '../../util/makeTemplate'

const Options = dynamic(() => import('../../components/Options'), { ssr: false })


import { download_resource_json,
  download_library_json } from '../MetadataSearch/download'

const download = {
  libraries: download_library_json,
  resources: download_resource_json,
}

export default class ResourcePage extends React.Component {
  componentDidMount() {
    M.AutoInit()
  }

  redirectLink(url) {
    return (e) => window.open(url, '_blank').focus()
  }

  async handleDownload(type, id) {
    NProgress.start()
    await download[type](id)
    NProgress.done()
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
                      <Link
                          to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
                          className="waves-effect waves-teal"
                        >
                        <IconButton
                          img={this.props.resource.meta.icon}
                          onClick={call(this.redirectLink, "/")}
                        />
                      </Link>
                    </div>
                    <div className="card-content col s11">
                      <div>
                        <span className="card-title">{this.props.resource.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, this.props.resource)}</span>
                      </div>
                      <ShowMeta
                        value={{
                          '@id': this.props.resource.id,
                          '@type': this.props.ui_values.preferred_name_singular['resources'] || 'Resource',
                          'meta': Object.keys(this.props.resource.meta).filter((key) => (
                            ['name', 'icon'].indexOf(key) === -1)).reduce((acc, key) => {
                            acc[key] = this.props.resource.meta[key]
                            return acc
                          }, {}),
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-action">
                  <Grid container justify="space-between">
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={1}>
                      <Link
                        to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
                        className="waves-effect waves-teal btn-flat"
                      >
                        BACK
                      </Link>
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </div>
          {!this.props.resource.is_library ?
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
                            schemas={this.props.schemas}
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
                        style={{
                          overflowWrap: 'break-word',
                          wordWrap: 'break-word',
                        }}
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
