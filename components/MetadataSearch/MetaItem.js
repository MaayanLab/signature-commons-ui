import React from 'react'
import dynamic from 'next/dynamic'
import Button from '@material-ui/core/Button';
import NProgress from 'nprogress'

import {download_signature_json,
        download_library_json} from './download'

const ShowMeta = dynamic(() => import('../../components/ShowMeta'), { ssr: false })
const Label = dynamic(() => import('../../components/Label'), { ssr: false })

const download = {
  libraries: download_library_json,
  signatures: download_signature_json,
}

export default class MetadataSearchResults extends React.Component {
  constructor(props) {
    super(props)
    this.initialize = this.initialize.bind(this)
  }

  async initialize(el) {
    if (el) {
      const M = await import('materialize-css')
      M.Collapsible.init(el)
    }
  }

  async handleDownload(type, id){
    NProgress.start()
    await download[type](id)
    NProgress.done()
  }

  render() {
    return (
      <ul
        className="collapsible popout"
        ref={this.initialize}
      >
        {this.props.items.map((item, ind) => {
          let value = []
          if (this.props.table_name === 'signatures') {
            value = [
              {
                '@id': item.library.id,
                '@type': this.props.preferred_name["libraries"] || "Library",
                'meta': item.library.meta,
              },
              {
                '@id': item.id,
                '@type': this.props.type,
                'meta': item.meta,
              },
            ]
          } else {
            value = [
              {
                '@id': item.id,
                '@type': this.props.type,
                'meta': item.meta,
              },
            ]
          }
          return (
            <li
              key={item.id}
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
                    item={item}
                    highlight={this.props.search}
                    visibility={1}
                  />
                  <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                  {this.props.table_name === "entities" || this.props.deactivate_download ? null:
                    <Button style={{
                      input: {
                        display: 'none',
                        }
                      }}
                      onClick={e => this.handleDownload(this.props.table_name, item.id)}
                      className={`mdi mdi-download mdi-24px`}
                    >{''}</Button>
                  }
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
                <div
                  style={{
                    height: '300px',
                    overflow: 'auto',
                  }}
                >
                  <ShowMeta
                    value={value}
                    highlight={this.props.search}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
