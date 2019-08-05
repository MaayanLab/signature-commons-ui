import React from 'react'
import dynamic from 'next/dynamic'
import { similar_search_terms } from '../Home'
const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))
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

export default class MetadataSearch extends React.Component {
  constructor(props) {
    super(props)
    this.searchChange = this.searchChange.bind(this)
  }

  async componentDidMount() {
    const currentSearchArray = getParam(this.props.location.search, 'q')
    if (!similar_search_terms(this.props.currentSearchArray, currentSearchArray)) {
      if (currentSearchArray.length > 0) {
        this.props.currentSearchArrayChange(currentSearchArray)
      }
    }
  }

  componentDidUpdate(prevProps) {
    const currentSearchArray = getParam(this.props.location.search, 'q')
    const oldSearchArray = getParam(prevProps.location.search, 'q')
    if (!similar_search_terms(oldSearchArray, currentSearchArray)) {
      if (currentSearchArray.length > 0) {
        this.props.currentSearchArrayChange(currentSearchArray)
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAllSearches()
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
            currentSearchArray={this.props.currentSearchArray}
            currentSearchChange={this.props.currentSearchChange}
            currentSearchArrayChange={this.props.currentSearchArrayChange}
            ui_values={this.props.ui_values}
          />
        </div>
        {this.props.currentSearchArray.length === 0 ? null :
          <SearchResults
            {...this.props}
          />
        }
      </div>
    )
  }
}
