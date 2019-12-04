import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from './IconButton'
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  download_signature_json,
  download_signatures_text,
  download_ranked_signatures_text,
  get_signature,
  download_library_json,
  download_library_gmt,
  download_library_tsv,
  fetch_schemas,
  get_label,
} from './MetadataSearch/download'

const ENRICHR_URL = process.env.NEXT_PUBLIC_ENRICHR_URL
  || (window.location.origin + '/Enrichr')

const FormData = require('form-data')
const fetch = require('isomorphic-unfetch')


const EnrichrDialog = (props) => {
  const {
    handleDialogClose,
    enrichr_status,
    enrichr_id,
    enrichr_ready,
    ...other
  } = props
  return (
    <Dialog onClose={handleDialogClose}
      aria-labelledby="simple-dialog-title"
      style={{
        padding: 20,
      }}
      {...other}>
      <DialogTitle id="simple-dialog-title">
        <Typography variant="overline" align="center" gutterBottom>
          {enrichr_status}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {enrichr_ready ?
          <a
            href={`${ENRICHR_URL}/enrich?dataset=${enrichr_id}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <IconButton
              src={`${process.env.PREFIX}/static/images/Enrichr_Libraries_Most_Popular_Genes.ico`}
            />
            <Typography style={{ fontSize: 15 }} align="center" variant="caption" display="block">
              Go to Enrichr
            </Typography>
          </a>:
          <div style={{textAlign: "center"}}>
            <CircularProgress />
          </div>
        }
      </DialogContent>
    </Dialog>
  )
}

async function submit_sigcom(item, history) {
  if (item.library.dataset_type==="rank_matrix"){
    history.push({
      pathname: `/SignatureSearch/Rank/${item.id}`,
    })
  }else{
    history.push({
      pathname: `/SignatureSearch/Overlap/${item.id}`,
    })
  }
}

export default class Options extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      enrichr_status: '',
      enrichr_ready: false,
      enrichr_open: false,
      enrichr_id: '',
    }
  }

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    })
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    })
  }

  handleDialogClose = () => {
    this.setState({
      enrichr_open: false,
      enrichr_ready: false,
    })
  }

  submit_enrichr = async (item) => {
    this.setState({
      enrichr_open: true,
      enrichr_ready: false,
      enrichr_status: 'Sending to enrichr',
    }, async () => {
      const schemas = await fetch_schemas()
      const signature = await get_signature({ item })
      let data
      if (signature.library.dataset_type === 'rank_matrix') {
        data = signature.data.slice(0, 250).map((d) => get_label(d, schemas))
      } else {
        data = signature.data.map((d) => get_label(d, schemas))
      }
      const filename = get_label(signature, schemas)
      const formData = new FormData()
      formData.append('list', data.join('\n'))
      formData.append('description', filename + '')
      const response = await (await fetch(`${ENRICHR_URL}/addList`, {
        method: 'POST',
        body: formData,
      })).json()
      this.setState((prevState) => ({
        enrichr_ready: true,
        enrichr_status: 'Analysis is ready',
        enrichr_id: response['shortId'],
      }))
      // window.open(`${ENRICHR_URL}/enrich?dataset=${response['shortId']}`, '_blank')
    })
  }

  handleDownloadJson = () => {
    this.handleClose()
    download_signature_json(this.props.item)
  }

  handleDownloadText = () => {
    this.handleClose()
    download_signatures_text(this.props.item)
  }

  handleDownloadRanked = () => {
    this.handleClose()
    download_ranked_signatures_text(this.props.item)
  }

  handleSubmitSigcom = () => {
    this.handleClose()
    submit_sigcom(this.props.item, this.props.history)
  }

  handleSubmitEnrichr = () => {
    this.handleClose()
    this.setState({
      enrichr_status: 'Fetching geneset...',
      enrichr_ready: false,
      enrichr_id: '',
    })
    this.submit_enrichr(this.props.item)
  }

  handleDownloadLibraryJson = () => {
    this.handleClose()
    download_library_json(this.props.item)
  }

  handleDownloadLibraryGmt = () => {
    this.handleClose()
    download_library_gmt(this.props.item)
  }

  handleDownloadLibraryTsv = () => {
    this.handleClose()
    download_library_tsv(this.props.item)
  }

  render = () => {
    if (this.props.type === 'signatures') {
      // TODO: Text here should be modified on the UI schemas + Enrichr link should be nullifiable
      return (
        <div>
          <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleClick}>
            <span className="mdi mdi-24px mdi-dots-vertical"></span>
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            <MenuItem onClick={this.handleDownloadJson}>
              <span className="mdi mdi-24px mdi-json"></span>
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                {this.props.ui_values.downloads.signature_json}
              </Typography>
            </MenuItem>
            <MenuItem onClick={this.handleDownloadText}>
              <span className="mdi mdi-24px mdi-file-document-box"></span>
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                {this.props.ui_values.downloads.geneset}
              </Typography>
            </MenuItem>
            {this.props.item.library && this.props.item.library.dataset_type === 'rank_matrix' ?
                <MenuItem onClick={this.handleDownloadRanked}>
                  <span className="mdi mdi-24px mdi-file-download"></span>
                  &nbsp;
                  <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                    {this.props.ui_values.downloads.ranked}
                  </Typography>
                </MenuItem> : null
            }
            { this.props.ui_values.downloads.sigcom ?
                <MenuItem onClick={this.handleSubmitSigcom}>
                  <img alt="Signature Commons"
                    src={`${process.env.PREFIX}/static/favicon.ico`}
                    style={{
                      width: 15,
                      height: 15,
                    }}/>
                    &nbsp;&nbsp;&nbsp;
                  <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                    Perform signature search
                  </Typography>
                </MenuItem> : null
            }
            { this.props.ui_values.downloads.enrichr ?
                <MenuItem onClick={this.handleSubmitEnrichr}>
                  <Avatar alt="Enrichr"
                    src={`${process.env.PREFIX}/static/images/Enrichr_Libraries_Most_Popular_Genes.ico`}
                    style={{
                      width: 20,
                      height: 20,
                    }}/>
                    &nbsp;&nbsp;
                  <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                    Submit to Enrichr
                  </Typography>
                </MenuItem> : null
            }
          </Menu>
          <EnrichrDialog
            handleDialogClose={this.handleDialogClose}
            open={this.state.enrichr_open}
            {...this.state}
          />
        </div>
      )
    } else if (this.props.type === 'libraries') {
      return (
        <div>
          <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleClick}>
            <span className="mdi mdi-24px mdi-dots-vertical"></span>
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            <MenuItem onClick={this.handleDownloadLibraryJson}>
              <span className="mdi mdi-24px mdi-json"></span>
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                {this.props.ui_values.downloads.library_json}
              </Typography>
            </MenuItem>
            <MenuItem onClick={this.handleDownloadLibraryGmt}>
              <span className="mdi mdi-24px mdi-file-document-box"></span>
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                { this.props.ui_values.downloads.gmt}
              </Typography>
            </MenuItem>
            <MenuItem onClick={this.handleDownloadLibraryTsv}>
              <span className="mdi mdi-24px mdi-file-table"></span>
                &nbsp;
              <Typography style={{ fontSize: 15 }} variant="caption" display="block">
                { this.props.ui_values.downloads.tsv }
              </Typography>
            </MenuItem>
          </Menu>
        </div>
      )
    } else {
      return null
    }
  }
}
