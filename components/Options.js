import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { download_signature_json,
  download_signatures_text,
  download_ranked_signatures_text,
  get_signature,
  download_library_json,
  download_library_gmt,
  download_library_tsv } from './MetadataSearch/download'

const ENRICHR_URL = process.env.NEXT_PUBLIC_ENRICHR_URL
  || (window.location.origin + '/Enrichr')

const FormData = require('form-data')
const fetch = require('isomorphic-unfetch')

async function submit_enrichr(item) {
  const { data, filename } = await get_signature(item)
  const formData = new FormData()
  formData.append('list', data.join('\n'))
  formData.append('description', filename + '')
  const response = await (await fetch(`${ENRICHR_URL}/addList`, {
    method: 'POST',
    body: formData,
  })).json()
  setTimeout(function() {
    window.open(`${ENRICHR_URL}/enrich?dataset=${response['shortId']}`, '_blank')
  }, 1000)
}

async function submit_sigcom(item, submit) {
  const { data } = await get_signature(item)
  const input = {
    id: item.id,
    type: 'Overlap',
    geneset: data.join('\n'),
  }
  submit(input)
}

export default function Options({ item, type, ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }
  if (type === 'signatures') {
    // TODO: Text here should be modified on the UI schemas + Enrichr link should be nullifiable
    return (
      <div>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          <span className="mdi mdi-dots-vertical"></span>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => {
            handleClose()
            download_signature_json(item)
          }
          }>
            <span className="mdi mdi-json"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              Download information as JSON
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_signatures_text(item)
          }
          }>
            <span className="mdi mdi-file-document-box"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              {props.ui_values.downloads.geneset}
            </Typography>
          </MenuItem>
          {item.library.dataset_type === 'rank_matrix' ?
            <MenuItem onClick={() => {
              handleClose()
              download_ranked_signatures_text(item)
            }
            }>
              <span className="mdi mdi-file-download"></span>
              &nbsp;
              <Typography variant="caption" display="block">
                {props.ui_values.downloads.ranked}
              </Typography>
            </MenuItem> : null
          }
          { props.ui_values.downloads.sigcom ?
            <MenuItem onClick={() => {
              handleClose()
              submit_sigcom(item, props.submit)
            }
            }>
              <img alt="Signature Commons"
                src={`${process.env.PREFIX}/static/favicon.ico`}
                style={{
                  width: 12,
                  height: 12,
                }}/>
                &nbsp;
              <Typography variant="caption" display="block">
                Pass to SigCom
              </Typography>
            </MenuItem> : null
          }
          { props.ui_values.downloads.enrichr ?
            <MenuItem onClick={() => {
              handleClose()
              submit_enrichr(item)
            }
            }>
              <Avatar alt="Enrichr"
                src={`${process.env.PREFIX}/static/images/Enrichr_Libraries_Most_Popular_Genes.ico`}
                style={{
                  width: 15,
                  height: 15,
                }}/>
                &nbsp;
              <Typography variant="caption" display="block">
                Pass to Enrichr
              </Typography>
            </MenuItem> : null
          }
        </Menu>
      </div>
    )
  } else if (type === 'libraries') {
    return (
      <div>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          <span className="mdi mdi-dots-vertical"></span>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => {
            handleClose()
            download_library_json(item)
          }
          }>
            <span className="mdi mdi-json"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              Download information as JSON
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_library_gmt(item)
          }
          }>
            <span className="mdi mdi-file-document-box"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              { props.ui_values.downloads.gmt}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_library_tsv(item)
          }
          }>
            <span className="mdi mdi-file-table"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              { props.ui_values.downloads.tsv }
            </Typography>
          </MenuItem>
        </Menu>
      </div>
    )
  } else {
    return null
  }
}
