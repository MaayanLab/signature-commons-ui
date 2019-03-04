import React from 'react'
import dynamic from 'next/dynamic';
import { call } from '../../util/call';

const ShowMeta = dynamic(() => import('../../components/ShowMeta'), { ssr: false })
const IconButton = dynamic(() => import('../../components/IconButton'), { ssr: false })
const Label = dynamic(() => import('../../components/Label'), { ssr: false })

export default class extends React.Component {
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
                flexDirection: "column",
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
              </div>
              <div style={{
                display: 'flex',
                flexDirection: "row",
              }}>
                <IconButton
                  alt="Enrichr"
                  img={`${process.env.PREFIX}/static/images/enrichr.ico`}
                />
                &nbsp;
                <IconButton
                  alt="Geneshot"
                  img={`${process.env.PREFIX}/static/images/geneshot.png`}
                />
                &nbsp;
                <IconButton
                  alt="ARCHS4"
                  img={`${process.env.PREFIX}/static/images/archs4.png`}
                />
                &nbsp;
                <IconButton
                  alt="Signature Commons"
                  img={`${process.env.PREFIX}/static/favicon.ico`}
                />
                &nbsp;
                <IconButton
                  alt="Download"
                  icon="file_download"
                  onClick={call(this.props.download, signature.id)}
                />
                &nbsp;
                {/*this.state.cart.has(signature.id) ? (
                  <IconButton
                    alt="Remove from Cart"
                    icon="remove_shopping_cart"
                    onClick={call(this.removeFromCart, signature.id)}
                  />
                ) : (
                  <IconButton
                    alt="Add to Cart"
                    icon="add_shopping_cart"
                    onClick={call(this.addToCart, signature.id)}
                  />
                )*/}
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
                    }
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
