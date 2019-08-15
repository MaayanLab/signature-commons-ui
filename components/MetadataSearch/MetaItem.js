import React from 'react'
import dynamic from 'next/dynamic'
import NProgress from 'nprogress'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'

import { download_signature_json,
  download_library_json } from './download'

const ShowMeta = dynamic(() => import('../../components/ShowMeta'), { ssr: false })
const Label = dynamic(() => import('../../components/Label'), { ssr: false })
const Options = dynamic(() => import('../../components/Options'), { ssr: false })


const download = {
  libraries: download_library_json,
  signatures: download_signature_json,
}

export default class MetadataSearchResults extends React.Component {
  constructor(props) {
    super(props)
  }

  initialize = async (el) => {
    if (el) {
      const M = await import('materialize-css')
      M.Collapsible.init(el)
    }
  }

  handleDownload = async (type, id) => {
    NProgress.start()
    await download[type](id)
    NProgress.done()
  }

  render = () => {
    if (this.props.items.length === 0) {
      return (
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item>
            <Card style={{ 'width': 500, 'height': 100, 'margin': '50px 0', 'textAlign': 'center', 'verticalAlign': 'middle' }}>
              <CardContent>
                <Typography variant="title" style={{ padding: '20px 0' }}>
                  No matching {this.props.type.toLowerCase()} found
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }
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
                '@type': this.props.preferred_name['libraries'] || 'Library',
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
                  {this.props.table_name === 'entities' || this.props.table_name === 'libraries' || this.props.deactivate_download ? null :
                    <Options type={this.props.table_name} item={item} ui_values={this.props.ui_values}
                      submit={this.props.submit} schemas={this.props.schemas}/>
                  }
                  <Label
                    item={item}
                    highlight={this.props.search}
                    visibility={1}
                    schemas={this.props.schemas}
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
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
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
