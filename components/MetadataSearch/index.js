import React from 'react'
import dynamic from 'next/dynamic'
import { fetch_meta } from '../../util/fetch/meta'

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))
const SearchResults = dynamic(() => import('../../components/MetadataSearch/SearchResults'))

function getParam(search, param) {
  const params = new URLSearchParams(search)
  let val = params.get(param)
  if (val == undefined || val === null || val == undefined) {
    val = ''
  }
  return val
}

export default class MetadataSearch extends React.Component {
  constructor(props) {
    super(props)
    this.searchChange = this.searchChange.bind(this)
  }

  async componentDidMount() {
    const currentSearch = getParam(this.props.location.search, 'q')
    if (currentSearch!==undefined){
      this.props.currentSearchChange(currentSearch)
    }
    this.props.resetMetadataSearchStatus()
  }

  componentDidUpdate() {
    if (this.props.completed_search === 3){
      this.props.resetMetadataSearchStatus()
    }
  }

  searchChange(e) {
    this.props.searchChange(e.target.value)
  }

  render() {
    return (
      <div className="row">
        <div className="col s12 center">
          <SearchBox
            search={this.props.search}
            searchChange={this.searchChange}
            currentSearchChange={this.props.currentSearchChange}
            ui_values={this.props.ui_values}
          />
        </div>
        <SearchResults
          {...this.props}
        />
      </div>
    )
  }
}
