import React from 'react'
import dynamic from 'next/dynamic'
import { Redirect } from 'react-router-dom'

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
    if (this.props.currentSearch !== currentSearch){
      if (currentSearch !== undefined || currentSearch === '') {
        this.props.currentSearchChange(currentSearch)
      }
    }
  }

  componentDidUpdate(prevProps) {
    const currentSearch = getParam(this.props.location.search, 'q')
    const old_search = getParam(prevProps.location.search, 'q')
    if (old_search !== currentSearch) {
      this.props.currentSearchChange(currentSearch)
    }
  }

  searchChange(e) {
    this.props.searchChange(e.target.value)
  }

  render() {
    const currentSearch = getParam(this.props.location.search, 'q')
    if (currentSearch === '') {
      this.props.handleChange({}, 'metadata', true)
      return <Redirect to={{ pathname: '/' }} />
    }
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
