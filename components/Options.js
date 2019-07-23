import React from 'react'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { get_concatenated_meta,
         download_signature_json,
         download_signatures_text } from './MetadataSearch/download'
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
          <span class="mdi mdi-dots-vertical"></span>
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
            <span class="mdi mdi-json"></span>
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
            <span class="mdi mdi-file-document-box"></span>
            &nbsp;
            <Typography variant="caption" display="block">
              Download geneset as a text file
            </Typography>
          </MenuItem>
          <MenuItem onClick={()=>{
              handleClose()
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