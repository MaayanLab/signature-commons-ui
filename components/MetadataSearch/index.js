import React from 'react'
import dynamic from 'next/dynamic'
import Grid from '@material-ui/core/Grid';
import MetadataSearchBox from './MetadataSearchBox'
import MetadataSearchResults from './MetadataSearchResults'
import { connect } from "react-redux";
import { fetchMetaDataFromSearchBox } from "../../util/redux/actions";

import Filter from './Filter'

// const MetadataSearchBox = dynamic(() => import('./MetadataSearchBox'))
const SearchResults = dynamic(() => import('../../components/MetadataSearch/SearchResults'))

function getParam(s, param) {
  const search = s
  const params = new URLSearchParams(search)
  let val = params.get(param)
  if (val === undefined || val === null || val === '') {
    val = []
  } else {
    val = val.split('&')
    if (val.filter((v) => v.trim() === '').length === val.length) {
      val = []
    }
  }
  return val
}

const mapStateToProps = state => {
  return {
    search: state.search,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    searchFunction : (search) => 
      dispatch(fetchMetaDataFromSearchBox(search))
  };
}

class MetadataSearch extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.searchFunction(this.props.search)
  }

  render = () => {
    return(
      <Grid container
        spacing={24}>
        <Grid item xs={3}>
          <Grid container
            spacing={24}>
            <Grid item xs={12}>
              <MetadataSearchBox
                id='MetadataSearch'
                small
              />
            </Grid>
            <Grid item xs={12}>
              <Filter />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>
          <MetadataSearchResults />
        </Grid>
      </Grid>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MetadataSearch)
  // componentDidMount = async () => {
  //   const currentSearchArray = getParam(this.props.location.search, 'q')
  //   if (!similar_search_terms(this.props.currentSearchArray, currentSearchArray)) {
  //     if (currentSearchArray.length > 0) {
  //       this.props.currentSearchArrayChange(currentSearchArray)
  //     }
  //   }
  // }

  // componentDidUpdate = (prevProps) => {
  //   const currentSearchArray = getParam(this.props.location.search, 'q')
  //   const oldSearchArray = getParam(prevProps.location.search, 'q')
  //   if (!similar_search_terms(oldSearchArray, currentSearchArray)) {
  //     if (currentSearchArray.length > 0) {
  //       this.props.currentSearchArrayChange(currentSearchArray)
  //     }
  //   }
  // }

  // componentWillUnmount() {
  //   this.props.resetAllSearches()
  // }

  // render() {
  //   return (
  //     <div className="row">
  //       <div className="col s12 center">
  //         <MetadataSearchBox
  //           search_status={this.props.search_status}
  //           currentSearchArray={this.props.currentSearchArray}
  //           currentSearchChange={this.props.currentSearchChange}
  //           currentSearchArrayChange={this.props.currentSearchArrayChange}
  //           ui_values={this.props.ui_values}
  //         />
  //       </div>
  //       {this.props.currentSearchArray.length === 0 ? null :
  //         <SearchResults
  //           {...this.props}
  //         />
  //       }
  //     </div>
  //   )
  // }
