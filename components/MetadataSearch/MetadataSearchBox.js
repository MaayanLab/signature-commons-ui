import React from 'react'
import ChipInput from 'material-ui-chip-input'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import { fetchMetaDataFromSearchBox } from "../../util/redux/actions";
import { ReadURLParams, URLFormatter } from "../../util/helper/misc";

import { connect } from "react-redux";
import { SearchBox } from "./SearchBox"

const styles = (theme) => ({
  info: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  chip:{
    margin: theme.spacing.unit/2,
  },
  defaultChip: {
    ...theme.chipColors.default,
  },
  defaultLightChip: {
    ...theme.chipColors.defaultLight,
  },
  notChip: {
    ...theme.chipColors.alert,
  },
  orChip: {
    ...theme.chipColors.warning,
  },
  tooltip: {
    backgroundColor: "#FFF",
    maxWidth: 380,
  },
  tooltipButton: {
    marginTop:5,
    padding: "5px 0"
  },
  icon: {
    paddingBottom: 35,
    paddingLeft: 5,
  },
})

// function mapDispatchToProps(dispatch) {
//   return {
//     searchFunction : (search) => 
//       dispatch(fetchMetaDataFromSearchBox(search))
//   };
// }

const mapStateToProps = state => {
  return { loading: state.loading,
    completed: state.completed,
    examples: state.serverSideProps.ui_values.LandingText.search_terms,
    placeholder: state.serverSideProps.ui_values.LandingText.metadata_placeholder,
    preferred_name: state.serverSideProps.ui_values.preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
    MetadataSearchNav: state.serverSideProps.ui_values.nav.MetadataSearch || {}
  };
};


class MetadataSearchBox extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      search: []
    }
  }
  componentDidMount(){
    const param_str = this.props.location.search
    let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    this.setState({
      search: params.search
    })
  }

  componentDidUpdate(prevProps){
    const curr_param_str = this.props.location.search
    const old_param_str = prevProps.location.search
    if (old_param_str!==curr_param_str){
      let params = ReadURLParams(curr_param_str, this.props.reverse_preferred_name)
      this.setState({
        search: params.search
      })
    }
  }

  searchFunction = (search) => {
    this.setState({
      search
    }, ()=>{
      const current_table = this.props.match.params.table || this.props.preferred_name["signatures"] || this.props.preferred_name["libraries"]
      const param_str = this.props.location.search
      let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      params = {
        search
      }
      const query = URLFormatter({params,
        preferred_name: this.props.preferred_name})
      this.props.history.push({
        pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
        search: `?q=${query}`,
        state: {
          new_search: true,
          pagination: false,
          new_filter: false
        }
      })
    })
  }

  render() {
    return (
      <SearchBox 
        {...this.props}
        search={this.state.search}
        searchFunction={this.searchFunction}
      />
    )
  }
}
export default connect(mapStateToProps)(withStyles(styles)(MetadataSearchBox))

// export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MetadataSearchBox))
