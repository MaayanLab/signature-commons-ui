import React from 'react'
import dynamic from 'next/dynamic'

const ShowMeta = dynamic(() => import('../../components/ShowMeta'), { ssr: false })
const Label = dynamic(() => import('../../components/Label'), { ssr: false })

export default class MetadataSearchSignatures extends React.Component {
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

  render() {
    return (
      <ul
        className="collapsible popout"
        ref={this.initialize}
      >
        {this.props.signatures.map((signature, ind) => (
          <li
            key={signature.id}
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
                  item={signature}
                  highlight={this.props.search}
                  visibility={1}
                />
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
              <div
                style={{
                  height: '300px',
                  overflow: 'auto',
                }}
              >
                <ShowMeta
                  value={[
                    {
                      '@id': signature.id,
                      '@type': 'Signature',
                      'meta': signature.meta,
                    },
                    {
                      '@id': signature.library.id,
                      '@type': 'Library',
                      'meta': signature.library.meta,
                    },
                  ]}
                  highlight={this.props.search}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }
}
