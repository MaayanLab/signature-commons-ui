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

    this.state = {
      search: '',
      currentSearch: '',
      controller: undefined,
      total_count: undefined,
    }

    this.searchChange = this.searchChange.bind(this)
  }

  async componentDidMount() {
    const currentSearch = getParam(this.props.location.search, 'q')
    this.setState({
      search: currentSearch,
    })
    const { response } = await fetch_meta({ endpoint: '/signatures/count', body: {} })
    this.setState({
      currentSearch,
      total_count: response.count,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const prevSearch = getParam(prevProps.location.search, 'q')
    const currentSearch = getParam(this.props.location.search, 'q')
    if (prevSearch !== currentSearch) {
      this.setState({ search: currentSearch, currentSearch })
    }
  }

  searchChange(e) {
    this.setState({ search: e.target.value })
  }

  render() {
    return (
      <div className="row">
        <div className="col s12 center">
          <SearchBox
            search={this.state.search}
            searchChange={this.searchChange}
            ui_content={this.props.ui_content}
          />
        </div>
        {this.state.currentSearch === '' ? null : (
          <SearchResults
            total_count={this.state.total_count}
            search={this.state.currentSearch}
          />
        )}
      </div>
    )
  }
}
