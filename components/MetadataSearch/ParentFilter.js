import React from 'react'
import { connect } from "react-redux";
import { findMatchedSchema } from '../../util/objectMatch'
import { makeTemplate } from "../../util/makeTemplate"
import { diffList } from "../../util/helper/misc"
import Filter from "./Filter"
const mapStateToProps = state => {
  const schemas = state.serverSideProps.schemas
  console.log(state)
  return {
    schemas,
    search: state.search,
    parent_ids_mapping: state.parent_ids_mapping,
    selected_parent_ids: state.selected_parent_ids,
    table_count: state.table_count,
    table_count_per_parent: state.table_count_per_parent,
    categories: state.parents_mapping,
    completed: state.completed,
    pagination: state.pagination,
    reverse_preferred_name: state.reverse_preferred_name,
  }
}

class ParentFilter extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data_count: undefined,
      selected: undefined,
      mapping_id_to_name: undefined,
      mapping_name_to_id: undefined,
    }
  }

  getMapping = (current_table) => {
    const {schemas, parent_ids_mapping: mapping} = this.props
    const parent_ids_mapping = mapping[current_table]
    let mapping_id_to_name = {}
    console.log(mapping)
    console.log(current_table)
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
    }, () => this.updateDataCounts(current_table))
  }

  updateDataCounts = (current_table) => {
    const {
      mapping_id_to_name,
      mapping_name_to_id
    } = this.state
    const {table_count_per_parent, selected_parent_ids:select_ids} = this.props
    const selected_parent_ids = select_ids[current_table]
    const counts = table_count_per_parent[current_table]
    let data_count
    let selected = {}
    if (counts!==undefined){
      data_count = Object.entries(counts).filter(([id,val])=>
        val.count>0).map(([id, val])=>{
        const name = mapping_id_to_name[id]
        selected[name] = selected_parent_ids.indexOf(id)>-1
        return({
            count: val.count,
            name,
        })})
      console.log(data_count)
      this.setState({
        data_count,
        selected,
      })
    }else {
      this.setState({
        data_count: [],
        selected: {}
      })
    }
  }


  componentDidMount(){
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    console.log(this.props.reverse_preferred_name)
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
    const selected_parent_ids = Object.keys(selected).reduce((acc, name)=>{
      const id = mapping_name_to_id[name]
      const val = parent_ids_mapping[id]
      acc = {
        ...acc,
        [id]: val
      }
    }, {})

    this.setState((prevState)=>({
      selected
    }))
  }

  render = () => (
    <Filter 
      {...this.state}
      loaded={this.props.completed}
      toggleSelect={this.toggleSelect}
    />
  )

}


export default connect(mapStateToProps)(ParentFilter)
