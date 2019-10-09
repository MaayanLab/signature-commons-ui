import React from 'react'
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom'
import NProgress from 'nprogress'

import {get_signature, get_library} from "../MetadataSearch/download"

const metadata_mapper = {
  libraries: get_library,
  signatures: get_signature
}
const mapStateToProps = state => {
  const preferred_name = state.serverSideProps.ui_values.preferred_name
  return {
    preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
  }
}

class Pages extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      metadata: {},
      children: []
    }
  }

  componentDidMount = async () => {
    let {table, id: item} = this.props.match.params
    table = this.props.reverse_preferred_name[table]
    if (this.props.location.state!==undefined && this.props.location.state.item!==undefined){
      item = {
        ...this.props.location.state.item
      }
    }
    let metadata
    try {
      NProgress.start()
      console.log(item)
      metadata = await metadata_mapper[table]({item, opts:{
        resource: true,
        library: true,
        signatures: false,
        data: false,
        validator: true
      }})
      children = await metadata_mapper[table]({item, opts:{
        resource: false,
        library: true,
        signatures: true,
        data: false,
        validator: true
      }})
      console.log(children)
      NProgress.done()
      this.setState({metadata, children})
    }catch (error) {
      console.warn(error)
      this.setState({
        metadata: undefined
      })
    }
  }

  render = () => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    if (current_table === undefined || this.state.metadata===undefined){
      return <Redirect to="/not-found" />
    }
    return(
      <div>
      something
      </div>
    )
  }
}

export default connect(mapStateToProps)(Pages)
