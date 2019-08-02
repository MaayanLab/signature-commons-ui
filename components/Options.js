import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import NProgress from 'nprogress'

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

async function submit_enrichr({item, ui_schemas}) {
  NProgress.start()
  const { data, filename } = await get_signature({item, ui_schemas})
  const formData = new FormData()
  formData.append('list', data.join('\n'))
  formData.append('description', filename + '')
  const response = await (await fetch(`${ENRICHR_URL}/addList`, {
    method: 'POST',
    body: formData,
  })).json()
  window.open(`${ENRICHR_URL}/enrich?dataset=${response['shortId']}`, '_blank')
  NProgress.done()
}

async function submit_sigcom(item, submit, ui_schemas) {
  const { data } = await get_signature({item, ui_schemas})
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
          <span className="mdi mdi-24px mdi-dots-vertical"></span>
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
            download_signature_json({item, ui_schemas:props.schemas})
          }
          }>
            <span className="mdi mdi-24px mdi-json"></span>
            &nbsp;
            <Typography style={{fontSize: 15}} variant="caption" display="block">
              {props.ui_values.downloads.signature_json}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_signatures_text({item, ui_schemas:props.schemas})
          }
          }>
            <span className="mdi mdi-24px mdi-file-document-box"></span>
            &nbsp;
            <Typography style={{fontSize: 15}} variant="caption" display="block">
              {props.ui_values.downloads.geneset}
            </Typography>
          </MenuItem>
          {item.library.dataset_type === 'rank_matrix' ?
            <MenuItem onClick={() => {
              handleClose()
              download_ranked_signatures_text({item, ui_schemas:props.schemas})
            }
            }>
              <span className="mdi mdi-24px mdi-file-download"></span>
              &nbsp;
              <Typography style={{fontSize: 15}} variant="caption" display="block">
                {props.ui_values.downloads.ranked}
              </Typography>
            </MenuItem> : null
          }
          { props.ui_values.downloads.sigcom ?
            <MenuItem onClick={() => {
              handleClose()
              submit_sigcom(item, props.submit, ui_schemas=props.schemas)
            }
            }>
              <img alt="Signature Commons"
                src={`${process.env.PREFIX}/static/favicon.ico`}
                style={{
                  width: 15,
                  height: 15,
                }}/>
                &nbsp;&nbsp;&nbsp;
              <Typography style={{fontSize: 15}} variant="caption" display="block">
                Perform signature search
              </Typography>
            </MenuItem> : null
          }
          { props.ui_values.downloads.enrichr ?
            <MenuItem onClick={() => {
              handleClose()
              submit_enrichr({item, ui_schemas:props.schemas})
            }
            }>
              <Avatar alt="Enrichr"
                src={`${process.env.PREFIX}/static/images/Enrichr_Libraries_Most_Popular_Genes.ico`}
                style={{
                  width: 20,
                  height: 20,
                }}/>
                &nbsp;&nbsp;
              <Typography style={{fontSize: 15}} variant="caption" display="block">
                Submit to Enrichr
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
          <span className="mdi mdi-24px mdi-dots-vertical"></span>
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
            download_library_json({item, ui_schemas:props.schemas})
          }
          }>
            <span className="mdi mdi-24px mdi-json"></span>
            &nbsp;
            <Typography style={{fontSize: 15}} variant="caption" display="block">
              {props.ui_values.downloads.library_json}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_library_gmt({item, ui_schemas:props.schemas})
          }
          }>
            <span className="mdi mdi-24px mdi-file-document-box"></span>
            &nbsp;
            <Typography style={{fontSize: 15}} variant="caption" display="block">
              { props.ui_values.downloads.gmt}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose()
            download_library_tsv({item, ui_schemas:props.schemas})
          }
          }>
            <span className="mdi mdi-24px mdi-file-table"></span>
            &nbsp;
            <Typography style={{fontSize: 15}} variant="caption" display="block">
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
