import React from 'react'
import ChipInput from 'material-ui-chip-input'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import { fetchMetaData } from "../../util/redux/actions";
import { connect } from "react-redux";
import { SearchBox } from "./SearchBox"


const styles = (theme) => ({
  info: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  tooltip: {
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    maxWidth: 380,
  },
})

const Info = (props) => {
  const { classes } = props
  return (
    <div className={classes.info}>
      <Typography variant="h5">
          Search operators
      </Typography>
      <ul>
        <li>
          <div>
            <Typography variant="h6">
                Exclude word from search
            </Typography>
            <Typography variant="body2">
              {'Prefix query with "-" or "!", e.g.'} &nbsp;
            </Typography>
            <Typography variant="overline" gutterBottom>
              <Chip
                label={'Imatinib'}
                onDelete={() => {}}
              /> -Stat3
            </Typography>
          </div>
        </li>
        <li>
          <div>
            <Typography variant="h6">
                Combine searches
            </Typography>
            <Typography variant="body2">
              {'Prefix query "or " or "|", e.g.'} &nbsp;
            </Typography>
            <Typography variant="overline" gutterBottom>
              <Chip
                label={'Imatinib'}
                onDelete={() => {}}
              /> or Stat3
            </Typography>
          </div>
        </li>
        <li>
          <div>
            <Typography variant="h6">
                Search for specific field
            </Typography>
            <Typography variant="body2">
              {'Prefix query with "[desired_field]:", e.g.'}
            </Typography>
            <Typography variant="overline" gutterBottom>
              <Chip
                label={'Disease: neuropathy'}
                onDelete={() => {}}
              /> {'PMID: 12345'}
            </Typography>
          </div>
        </li>
      </ul>
    </div>
  )
}

function mapDispatchToProps(dispatch) {
  return {
    fetchMetaData: search => dispatch(fetchMetaData(search))
  };
}

const mapStateToProps = state => {
  return { loading_metadata: state.loading_metadata,
    ui_values: state.serverSideProps.ui_values,
  };
};


class MetadataSearchBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: [],
    }
  }

  performSearch = (search) => {
    this.setState({
      search
    }, ()=>this.props.fetchMetaData(search))
  }

  render() {
    const examples = this.props.ui_values.LandingText.search_terms
    const { classes } = this.props
    return (
      <div>
        <SearchBox search={this.state.search}
          searchFunction={this.performSearch}
          loading={this.props.loading_metadata}
          placeholder={this.props.ui_values.LandingText.metadata_placeholder}
        />
        {examples.map((example) => (
          <a
            key={example}
            className="chip grey white-text waves-effect waves-light"

            onClick={() => this.performSearch([example])}
          >
            {example}
          </a>
        ))}
        <Tooltip title={<Info {...this.props}/>} interactive placement="right-start" classes={{ tooltip: classes.tooltip }}>
          <span className="mdi mdi-information mdi-18px" />
        </Tooltip>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MetadataSearchBox))
