import React from 'react'

import { makeTemplate } from '../../util/makeTemplate'
import {findMatchedSchema} from '../../util/objectMatch'
import { diffList } from "../../util/helper/misc"

import { connect } from "react-redux";

import DataTable from "./DataTable"

export const value_by_type = {
  text: ({label, prop, data}) => {
    let val = makeTemplate(prop.text, data)
    if (val === 'undefined'){
      return null
    } else {
      return val
    }
  },
  'img': ({label, prop, data }) => {
    const src = makeTemplate(prop.src, data)
    const alt = makeTemplate(prop.alt, data)
    if ( alt === 'undefined'){
      return null
    } else {
      return {alt, src}
    }
  },
}

export const get_card_data = (data, schemas, highlight=undefined) => {
  const schema = findMatchedSchema(data, schemas)
  if (schema!==null){
    const { properties } = schema
    let scores= {}
    let tags = []
    const processed = {id: data.id}
    console.log(data)
    for (const label of Object.keys(properties)){
      const prop = properties[label]
      const val = value_by_type[prop.type]({label, prop, data, highlight})
      if (prop.name){
        processed.name = val || data.id
      }else if (prop.subtitle){
        if (val!==null) processed.subtitle = val
      }else if (prop.icon){
        if (val!==null){
          processed.icon = {...val}
        }
      }else if (prop.score){
        if (val!==null) scores[label] = {
          label,
          value: val,
          icon: prop.MDI_Icon || 'mdi-star'
        }
      }else {
        console.log(val)
        console.log(prop)
        if ( val !== null) tags = [...tags, {
          label,
          value: val,
          icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
          priority: prop.priority
        }]
      }
    }
    tags = tags.sort((a, b) => a.priority - b.priority)
    if (Object.keys(scores).length>0) processed.scores = scores
    processed.tags = tags || []
    return {original: data, processed}
  }
}

const mapStateToProps = state => {
  return {
    schemas: state.serverSideProps.schemas,
    data: state.metadata_results[state.current_table],
    search: state.search,
    ui_values:state.serverSideProps.ui_values,
    parent: state.parents_mapping[state.current_table],
    current_table: state.current_table,
  }
}

class MetadataSearchResults extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      collection: [],
      sorted: null
    }
  }

  componentDidMount = () => {
    const coll = this.props.data || []
    const collection = coll.map(data=>get_card_data(data, this.props.schemas))
    this.setState({
      collection
    })
  }

  sortBy = (sorted) => {
    const collection = this.props.collection
    collection = collection.sort((a, b) => a.processed.scores[sorted].value - b.processed.scores[sorted].value)
    this.setState({
      collection,
      sorted,
    })
  }

  componentDidUpdate = (prevProps) => {
    const old = prevProps.data || []
    const curr = this.props.data || []
    const old_list = old.map(i=>i.id)
    const new_list = curr.map(i=>i.id)
    console.log(diffList(old_list, new_list))
    if (diffList(old_list, new_list)){
      const collection = this.props.data.map(data=>get_card_data(data, this.props.schemas))
      console.log(collection)
      this.setState({
        collection
      })
    }
  }

  render = () => (
    <DataTable schemas={this.props.schemas}
      {...this.props}
      {...this.state}
      sortingFunction={this.sortBy}
    />
  )
}

export default connect(mapStateToProps)(MetadataSearchResults)
