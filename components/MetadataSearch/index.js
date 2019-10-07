import React from 'react'
import dynamic from 'next/dynamic'
import { Switch, Route, Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import MetadataSearchBox from './MetadataSearchBox'
import MetadataSearchResults from './MetadataSearchResults'
import { connect } from "react-redux";
import { fetchMetaDataFromSearchBox,
  changeMetadataSearchTable,
  fetchMetaData,
 } from "../../util/redux/actions";
import { ReadURLParams, diffList, URLFormatter } from "../../util/helper/misc";
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ParentFilter from './ParentFilter'

const operationMapper = {
  new_search: (table, currentTable) => ({
    metadata_search: table===currentTable,
    per_parent_count: table===currentTable,
    value_count: table===currentTable,
    count: true
  }),
  pagination: (table, currentTable) => ({
    metadata_search: table===currentTable,
    per_parent_count: false,
    value_count: false,
    count: false
  }),
  new_filter: (table, currentTable) => ({
    metadata_search: table===currentTable,
    per_parent_count: table===currentTable,
    value_count: table===currentTable,
    count: table===currentTable,
  }),
}

const mapStateToProps = state => {
  const preferred_name = state.serverSideProps.ui_values.preferred_name
  return {
    search: state.search,
    models: state.models,
    tables: Object.keys(state.parents_mapping),
    preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    searchBoxFunction : (params, currentTable) => 
      dispatch(fetchMetaDataFromSearchBox(params, currentTable)),
    searchFunction: (params, table, paginating=false) =>
      dispatch(fetchMetaData(params,table, paginating)),
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
    let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    console.log(params)
    const {new_search, pagination, new_filter} = this.props.location.state || { new_search: true}
    for (const table of this.props.tables){
      let operations
      if (new_search){
        operations = operationMapper.new_search(table, newTable)
      }else if (pagination){
        operations = operationMapper.pagination(table, newTable)
      }else if (new_filter){
        operations = operationMapper.new_filter(table, newTable)
      }
      if (params[table]){
        params = {
          ...params,
          [table]: {
            ...params[table],
            operations
          }
        }
      }else{
        params = {
          ...params,
          [table]: {
            operations
          }
        }
      }
    }
    console.log(params)
    this.props.searchBoxFunction(params, newTable)
  }
  componentDidUpdate(prevProps) {
      const prev_table = this.props.reverse_preferred_name[prevProps.match.params.table]
      const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
      const old_param_str = prevProps.location.search
      const current_param_str = this.props.location.search
      if (prev_table !== current_table){
        const params = ReadURLParams(param_str, this.props.reverse_preferred_name)
        
      }
      // const param_str = this.props.location.search
      // const params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      // const old_param_str = prevProps.location.search
      // const old_params = ReadURLParams(old_param_str, this.props.reverse_preferred_name)
      // const state = this.props.location.state || { new_search: true}
  }
  // componentDidUpdate(prevProps) {
  //   const prevTable = this.props.reverse_preferred_name[prevProps.match.params.table]
  //   const newTable = this.props.reverse_preferred_name[this.props.match.params.table]
  //   const param_str = this.props.location.search
  //   const params = ReadURLParams(param_str, this.props.reverse_preferred_name)
  //   const old_param_str = prevProps.location.search
  //   const old_params = ReadURLParams(old_param_str, this.props.reverse_preferred_name)
  //   const state = this.props.location.state || { new_search: true}

  //   if (prevTable!==newTable){
  //     this.props.changeTab(newTable)
  //     this.setState({
  //       index_value: this.props.tables.indexOf(newTable),
  //     })
  //   }
  //   if (param_str!==old_param_str){
  //     // search has changed
  //     if (diffList(old_params.search, params.search)){
  //       this.props.searchBoxFunction(params, newTable)
  //     } else {
  //       // this.props.searchFunction(params, newTable)
  //     }
  //   }
  // }


  handleChange = (event, newIndex) => {
    const newTable = this.props.tables[newIndex]
    this.setState({
      index_value: newIndex,
    }, ()=>{
      const param_str = this.props.location.search
      const {search} = ReadURLParams(param_str, this.props.reverse_preferred_name)
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
            const model = this.props.models[table]
            let count = ''
            if (model!==undefined){
              count = model.results!==undefined && model.results.count!==undefined? ` (${model.results.count})` : ''
            }
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
    const currentTable = this.props.reverse_preferred_name[this.props.match.params.table]

    if (currentTable === undefined){
      return <Redirect to="/not-found" />
    }
    // else if (this.props.location.search===""){
    //   return <Redirect to="/" />
    // }
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
