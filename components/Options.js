import React from 'react'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { get_concatenated_meta,
         download_signature_json,
         download_signatures_text,
         download_ranked_signatures_text,
         get_signature } from './MetadataSearch/download'

const FormData = require('form-data')
const fetch = require('isomorphic-unfetch')

async function submit_enrichr(item) {
  const {data, filename} = await get_signature(item)
  const formData = new FormData()
  formData.append('list', data.join('\n'))
  formData.append('description', filename+'')
  const response = await (await fetch('http://amp.pharm.mssm.edu/Enrichr/addList', {
    method: 'POST',
    body: formData,
  })).json()
  setTimeout(function(){
        window.location.href = `http://amp.pharm.mssm.edu/Enrichr/enrich?dataset=${response['shortId']}`
    }, 1000);
}

export default function Options({item, type}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }
  if (type === "signatures"){
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
          <MenuItem onClick={()=>{
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
          <MenuItem onClick={()=>{
              handleClose()
              download_signatures_text(item)
            }
          }>
            <span className="mdi mdi-file-document-box"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              Download geneset as a text file
            </Typography>
          </MenuItem>
          {item.library.dataset_type==="rank_matrix" ?
            <MenuItem onClick={()=>{
              handleClose()
              download_ranked_signatures_text(item)
            }
            }>
              <span className="mdi mdi-file-download"></span>
              &nbsp;
              <Typography variant="caption" display="block">
                Download ranked geneset
              </Typography>
            </MenuItem>: null
          }
          <MenuItem onClick={()=>{
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
          </MenuItem>
        </Menu>
      </div>
    )
  }else {
    return null
  }
}