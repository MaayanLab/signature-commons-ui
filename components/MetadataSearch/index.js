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
    this.props.currentSearchChange(currentSearch)
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
        {this.props.currentSearch === '' ? null : (
          <SearchResults
            signatures_total_count={this.props.signatures_total_count}
            libraries_total_count={this.props.libraries_total_count}
            entities_total_count={this.props.entities_total_count}
            search={this.props.currentSearch}
            ui_values={this.props.ui_values}
            schemas={this.props.schemas}
          />
        )}
      </div>
    )
  }
}
