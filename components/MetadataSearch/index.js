import React from 'react'
import dynamic from 'next/dynamic'
import { Switch, Route, Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import MetadataSearchBox from './MetadataSearchBox'
import MetadataSearchResults from './MetadataSearchResults'
import { connect } from "react-redux";
import { fetchMetaDataFromSearchBox,
  changeMetadataSearchTable,
 } from "../../util/redux/actions";
import { ReadURLParams, diffList, URLFormatter } from "../../util/helper/misc";
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ParentFilter from './ParentFilter'

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
  const preferred_name = state.serverSideProps.ui_values.preferred_name
  return {
    search: state.search,
    table_count: state.table_count,
    tables: Object.keys(state.parents_mapping),
    current_table: state.current_table,
    preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
    filter_mapper: state.filter_mapper,
    pagination_mapper: state.pagination_mapper,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    searchFunction : ({search, filters, skip, limit}) => 
      dispatch(fetchMetaDataFromSearchBox({search, filters, skip, limit})),
    changeTab: (newTable) =>
      dispatch(changeMetadataSearchTable(newTable))
  };
}

class MetadataSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index_value: 0,
    }
  }

  componentDidMount() {
    const newTable = this.props.reverse_preferred_name[this.props.match.params.table]
    this.props.changeTab(newTable)
    this.setState({
      index_value: this.props.tables.indexOf(newTable),
    })
    const param_str = this.props.location.search
    const params = ReadURLParams(param_str)
    this.props.searchFunction({...params})
  }

  componentDidUpdate(prevProps) {
    const prevTable = this.props.reverse_preferred_name[prevProps.match.params.table]
    const newTable = this.props.reverse_preferred_name[this.props.match.params.table]
    const param_str = this.props.location.search
    const params = ReadURLParams(param_str)
    const old_param_str = prevProps.location.search
    const old_params = ReadURLParams(old_param_str)
    
    if (prevTable!==newTable){
      this.props.changeTab(newTable)
      this.setState({
        index_value: this.props.tables.indexOf(newTable),
      })
    }
    if (param_str!==old_param_str){
      // search has changed
      console.log(old_params)
      console.log(params)
      if (diffList(old_params.search, params.search)){
        this.props.searchFunction({...params})
      }
    }
  }


  handleChange = (event, newIndex) => {
    const newTable = this.props.tables[newIndex]
    this.setState({
      index_value: newIndex,
    }, ()=>{
      const param_str = this.props.location.search
      const {search} = ReadURLParams(param_str)
      const {skip, limit} = this.props.pagination_mapper[newTable] || {}
      const params = {
        search,
        limit,
        skip,
        filters: this.props.filter_mapper[newTable]
      }
      const query = URLFormatter({...params})
      this.props.history.push({
        pathname: `/MetadataSearch/${this.props.preferred_name[newTable]}`,
        search: `?q=${query}`
      })
    })
  }

  searchBox = (props) => (
    <MetadataSearchBox
      id='MetadataSearch'
      {...props}
      small
    />
  )

  parentFilter = (props) => (
    <ParentFilter
      {...props}
    />
  )

  data_table = (props) => {
    const current_table = this.props.reverse_preferred_name[props.match.params.table]
    if (this.props.tables.indexOf(current_table) === -1){
      this.props.history.push(`/not-found`)
    }
    return(
      <React.Fragment>
        <Tabs
          value={this.state.index_value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          {this.props.tables.map((table) => {
            const count = this.props.table_count[table]===undefined ? '': ` (${this.props.table_count[table]})`
            return(
            <Tab
                key={table}
                label={`${this.props.preferred_name[table]}${count}`}
              />
            )})}
        </Tabs>
        <MetadataSearchResults {...props}/>
      </React.Fragment>
    )
  }

  render = () => {
    return(
      <Grid container
        spacing={24}>
        <Grid item xs={3}>
          <Grid container
            spacing={24}>
            <Grid item xs={12}>
              <Route path="/MetadataSearch/:table" component={this.searchBox} />
            </Grid>
            <Grid item xs={12}>
              <Route path="/MetadataSearch/:table" component={this.parentFilter} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>
          <Route path="/MetadataSearch/:table" component={this.data_table} />
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
