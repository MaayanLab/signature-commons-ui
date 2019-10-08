import React from 'react'
import { connect } from "react-redux";
import { findMatchedSchema } from '../../util/objectMatch'
import { makeTemplate } from "../../util/makeTemplate"
import { ReadURLParams, URLFormatter } from "../../util/helper/misc"
import Filter from "./Filter"

const mapStateToProps = state => {
  const schemas = state.serverSideProps.schemas
  return {
    schemas,
    parent_ids_mapping: state.parent_ids_mapping,
    models: state.models,
    parents: state.parents_mapping,
    completed: state.completed,
    reverse_preferred_name: state.reverse_preferred_name,
  }
}

class ParentFilter extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data_count: [],
      selected: {},
      mapping_id_to_name: undefined,
      mapping_name_to_id: undefined,
    }
  }

  getMapping = (current_table) => {
    const {schemas, parent_ids_mapping: mapping} = this.props
    const parent_ids_mapping = mapping[current_table]
    let mapping_id_to_name = {}
    const mapping_name_to_id = Object.entries(parent_ids_mapping).reduce((acc,[id, val])=>{
      const matched_schema = findMatchedSchema(val, schemas)
      let name_prop = Object.keys(matched_schema.properties).filter(prop=> matched_schema.properties[prop].name)
      let name
      if (name_prop.length > 0){
        name = makeTemplate(matched_schema.properties[name_prop[0]].text, val)
      } else {
        console.warn('source of resource name is not defined, using either Name or ids')
        name = resource.meta['Name'] || id
      }
      mapping_id_to_name = {
        ...mapping_id_to_name,
        [id]: name
      }
      acc = {
        ...acc,
        [name]:id
      }
      return acc
    },{})
    this.setState({
      mapping_id_to_name,
      mapping_name_to_id,
      current_table
    }, ()=>{
      this.updateDataCounts(current_table)
    })
  }

  updateDataCounts = (current_table) => {
    const {
      mapping_id_to_name,
      mapping_name_to_id
    } = this.state
    const model = this.props.models[current_table]
    let per_parent_count = {}
    if (model!==undefined){
      per_parent_count = model.results.per_parent_count || {}
    }
    let selected_parents = []
    const parent = this.props.parents[current_table]
    if (model!==undefined && model.filters!==undefined && model.filters[parent]!==undefined){
      selected_parents = [...model.filters[parent]]
    }
    const selected = {}
    let data_count = []
    for (const [pid, count] of Object.entries(per_parent_count)){
      if (count>0){
        const name = mapping_id_to_name[pid]
        selected[name] = selected_parents.indexOf(pid)>-1
        data_count = [...data_count, {count, name, id:pid}]
      }
    }
    this.setState({
      data_count,
      selected,
    })
  }


  componentDidMount(){
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    this.getMapping(current_table)
  }

  componentDidUpdate(prevProps){
    const prevTable = prevProps.match.params.table
    const current_table = this.props.match.params.table
    if (prevTable!==current_table){
      this.getMapping(this.props.reverse_preferred_name[current_table])
    }else if(!prevProps.completed && this.props.completed){
      this.getMapping(this.props.reverse_preferred_name[current_table])
    }
  }

  toggleSelect = (name) => {
    const {
      mapping_id_to_name,
      mapping_name_to_id
    } = this.state
    const parent_ids_mapping = this.props.parent_ids_mapping
    const selected = {
      ...this.state.selected,
      [name]: !this.state.selected[name]
    }
    const selected_parent_ids = Object.entries(selected).filter(([name, val])=>
      val).map(([name,val])=>{
        const id = mapping_name_to_id[name]
        return(id)
      })
    this.setState((prevState)=>({
      selected
    }), ()=>{
      const current_table = this.props.match.params.table
      const param_str = decodeURI(this.props.location.search)
      let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      params = {
        ...params,
        filters: {
          ...params.filters,
          [this.props.parents[this.props.reverse_preferred_name[current_table]]]: selected_parent_ids.length > 0 ? selected_parent_ids: undefined
        }
      }
      const query = URLFormatter({...params, current_table})
      this.props.history.push({
        pathname: `/MetadataSearch/${current_table}`,
        search: `?q=${query}`,
        state: {
          new_search: false,
          pagination: false,
          new_filter: true
        }
      })
    })
  }

  render = () => {
    return(
      <Filter 
        {...this.state}
        loaded={this.props.completed || this.props.pagination}
        toggleSelect={this.toggleSelect}
      />
    )}

}


export default connect(mapStateToProps)(ParentFilter)
