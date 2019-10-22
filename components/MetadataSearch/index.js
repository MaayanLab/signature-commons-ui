import React from 'react'
import dynamic from 'next/dynamic'
import { Switch, Route, Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import MetadataSearchBox from './MetadataSearchBox'
import MetadataSearchResults from './MetadataSearchResults'
import { connect } from "react-redux";
import { fetchMetaDataFromSearchBox,
  fetchMetaData,
 } from "../../util/redux/actions";
import { ReadURLParams, diffList, URLFormatter } from "../../util/helper/misc";
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ParentFilter from './ParentFilter'
import CircularProgress from '@material-ui/core/CircularProgress';

const operationMapper = {
  new_search: (table, current_table) => ({
    metadata_search: table===current_table,
    per_parent_count: table===current_table,
    value_count: table===current_table,
    count: true
  }),
  pagination: (table, current_table) => ({
    metadata_search: table===current_table,
    per_parent_count: false,
    value_count: false,
    count: false
  }),
  new_filter: (table, current_table) => ({
    metadata_search: table===current_table,
    per_parent_count: table===current_table,
    value_count: table===current_table,
    count: true,
  }),
  change_tab: (table, current_table) => ({
    metadata_search: table===current_table,
    per_parent_count: table===current_table,
    value_count: table===current_table,
    count: true,
  }),
  order: (table, current_table) => ({
    metadata_search: table===current_table,
    per_parent_count: false,
    value_count: false,
    count: false
  })
}

const mapStateToProps = state => {
  const preferred_name = state.serverSideProps.ui_values.preferred_name
  return {
    search: state.search,
    completed: state.completed,
    models: state.models,
    tables: Object.keys(state.parents_mapping),
    preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
    MetadataSearchNav: state.serverSideProps.ui_values.nav.MetadataSearch || {},
    order_default: state.serverSideProps.ui_values.order_default || {},
  }
}

function mapDispatchToProps(dispatch) {
  return {
    searchBoxFunction : (params) => 
      dispatch(fetchMetaDataFromSearchBox(params)),
    searchFunction: (params) =>
      dispatch(fetchMetaData(params)),
  };
}

class MetadataSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index_value: 0,
      pagination: false,
      order: props.order_default,
    }
  }

  getOperationsKey = () => {
    let operations_key = "new_search"
    if (this.props.location.state!==undefined){
      const o = Object.keys(this.props.location.state).filter(s=>
      this.props.location.state[s]===true)
      if (o.length > 0){
        operations_key = o[0]
      }
    }
    return operations_key
  }

  componentDidMount() {
    const new_table = this.props.reverse_preferred_name[this.props.match.params.table]
    const param_str = decodeURI(this.props.location.search)
    let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    for (const table of this.props.tables){
      const operations_key = this.getOperationsKey()
      const operations = operationMapper[operations_key](table, new_table)
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
     if (this.state.order[table]!==undefined && params[table].order!==undefined && params[table].order!==this.state.order[table]){
        this.setState({
          order: {
            ...this.state.order,
            [table]: params[table].order
          }
        })
      }else if (this.props.order_default[table]!==undefined && params[table].order===undefined){
        this.setState({
          order: {
            ...this.state.order,
            [table]: this.props.order_default[table]
          }
        })
        params[table].order = this.props.order_default[table]
      }
    }
    this.setState({
      index_value: this.props.tables.indexOf(new_table),
    }, ()=>{
      this.props.searchBoxFunction(params)
    })
  }


  componentDidUpdate(prevProps) {
      const prev_table = this.props.reverse_preferred_name[prevProps.match.params.table]
      const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
      const old_param_str = decodeURI(prevProps.location.search)
      const current_param_str = decodeURI(this.props.location.search)
      let params
      if (prev_table !== current_table && current_param_str === old_param_str){
        const model = this.props.models[current_table]
        if (model.results.metadata_search === undefined){
          const operations_key = this.getOperationsKey()
          const operations = operationMapper[operations_key](current_table, current_table)
          params = this.format_param(current_param_str, operations, current_table)
          this.props.searchFunction(params)
        }
      }else if(current_param_str!==old_param_str){
        
        if (this.props.location.state === undefined || this.props.location.state.new_search){
          params = ReadURLParams(current_param_str, this.props.reverse_preferred_name)
          for (const table of this.props.tables){
            const operations_key = this.getOperationsKey()
            const operations = operationMapper[operations_key](table, current_table)
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
            if (this.state.order[table]!==undefined && params[table].order!==undefined && params[table].order!==this.state.order[table]){
              
              this.setState({
                order: {
                  ...this.state.order,
                  [table]: params[table].order
                }
              })
            }else if (this.props.order_default[table]!==undefined && params[table].order===undefined){
              this.setState({
                order: {
                  ...this.state.order,
                  [table]: this.props.order_default[table]
                }
              })
              params[table].order = this.props.order_default[table]
            }
          }
          this.props.searchBoxFunction(params)
        } else {
          const operations_key = this.getOperationsKey()
          const operations = operationMapper[operations_key](current_table, current_table)
          params = this.format_param(current_param_str, operations, current_table)
          this.props.searchFunction(params)
        }
        let pagination = this.state.pagination
        if (this.props.location.state!== undefined){
          pagination = this.props.location.state.pagination || this.props.location.state.new_filter || false
        }
        this.setState({
          pagination,
        })
      }
      
      if (params!==undefined){
        const order = this.props.tables.filter(t=>params[t].order!==undefined).reduce((acc,t)=>{
          acc = {
            ...acc,
            [t]: params[t].order
          }
          return acc
        },{})
        
        this.setState({
          order: {
            ...this.state.order,
            ...order,
          }
        })
      }
  }

  format_param = (param_str, operations, table) => {
    let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    
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
    return params
  }
  // componentDidUpdate(prevProps) {
  //   const prevTable = this.props.reverse_preferred_name[prevProps.match.params.table]
  //   const new_table = this.props.reverse_preferred_name[this.props.match.params.table]
  //   const param_str = this.props.location.search
  //   const params = ReadURLParams(param_str, this.props.reverse_preferred_name)
  //   const old_param_str = prevProps.location.search
  //   const old_params = ReadURLParams(old_param_str, this.props.reverse_preferred_name)
  //   const state = this.props.location.state || { new_search: true}

  //   if (prevTable!==new_table){
  //     this.props.changeTab(new_table)
  //     this.setState({
  //       index_value: this.props.tables.indexOf(new_table),
  //     })
  //   }
  //   if (param_str!==old_param_str){
  //     // search has changed
  //     if (diffList(old_params.search, params.search)){
  //       this.props.searchBoxFunction(params, new_table)
  //     } else {
  //       // this.props.searchFunction(params, new_table)
  //     }
  //   }
  // }


  handleChange = (event, new_index) => {
    const new_table = this.props.tables[new_index]
    this.setState({
      index_value: new_index,
    }, ()=>{
      const query = this.props.location.search
      this.props.history.push({
        pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${this.props.preferred_name[new_table]}`,
        search: `${query}`,
        state: {
          change_tab: true
        }
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
      pagination={this.state.pagination}
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
            let count_text = ''
            let count
            if (model!==undefined){
              count = model.results.count || 0
              count_text = model.results!==undefined && this.props.completed ? ` (${count})` : ''
            }
            if (count === 0) return null
            return(
              <Tab
                  key={table}
                  label={`${this.props.preferred_name[table]}${count_text}`}
                />
              )})}
        </Tabs>
        <MetadataSearchResults {...props} order={this.state.order}/>
      </React.Fragment>
    )
  }

  render = () => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]

    if (current_table === undefined){
      return <Redirect to="/not-found" />
    }

    if (!this.props.completed){
      return(
        <Grid container
          spacing={24}>
          <Grid item xs={3}>
            <Grid container
              spacing={24}>
              <Grid item xs={12}>
                <Route path={`${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/:table`} component={this.searchBox} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9} style={{textAlign:"center", height:500, marginTop:50}}>
            <CircularProgress />
          </Grid>
        </Grid>
      )
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
              <Route path={`${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/:table`} component={this.searchBox} />
            </Grid>
            <Grid item xs={12}>
              <Route path={`${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/:table`} component={this.parentFilter} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>
          <Route path={`${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/:table`} component={this.data_table} />
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
