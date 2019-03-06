import React from 'react';
import dynamic from 'next/dynamic';
import NProgress from 'nprogress'
import { fetch_meta_post, fetch_meta } from "../../util/fetch/meta";

const SearchBox = dynamic(() => import('../../components/MetadataSearch/SearchBox'))
const Signatures = dynamic(() => import('../../components/MetadataSearch/Signatures'))

function build_where(q) {
  if (q.indexOf(':') !== -1) {
    const [key, ...value] = q.split(':')
    return {
      ['meta.' + key]: {
        ilike: '%' + value.join(':') + '%'
      }
    }
  } else {
    return {
      meta: {
        fullTextSearch: q
      }
    }
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props)

    const params = new URLSearchParams(props.location.search)
    const search = params.get('q')

    this.state = {
      search,
      params,
      controller: undefined,
      total_count: undefined,
    }

    this.searchChange = this.searchChange.bind(this)
    this.performSearch = this.performSearch.bind(this)
  }

  async componentDidMount() {
    this.performSearch(this.state.params.get('q'))

    const { response } = await fetch_meta('/signatures/count', {})
    this.setState({
      total_count: response.count
    })
  }

  searchChange(e) {
    this.setState({ search: e.target.value })
  }

  async performSearch(search) {
    if(this.state.controller !== undefined) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      NProgress.start()
      this.setState({
        status: 'Searching...',
        controller,
      })

      const where = build_where(search)

      const start = Date.now()
      const {duration: duration_meta_1, contentRange, response: signatures} = await fetch_meta_post('/signatures/find', {
        filter: {
          where,
          limit: 20,
        },
      }, controller.signal)

      const library_ids = [...new Set(signatures.map((sig) => sig.library))]
      const {duration: duration_meta_2, response: libraries} = await fetch_meta_post('/libraries/find', {
        filter: {
          where: {
            id: {
              inq: library_ids
            }
          },
        },
      }, controller.signal)

      const duration_meta = duration_meta_1 + duration_meta_2

      const library_dict = libraries.reduce((L, l) => ({...L, [l.id]: l}), {})

      for(const signature of signatures)
        signature.library = library_dict[signature.library]

      this.setState({
        signatures,
        status: '',
        duration: (Date.now() - start) / 1000,
        duration_meta,
        count: contentRange.count,
      }, () => NProgress.done())
    } catch(e) {
      NProgress.done()
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + '',
        })
      }
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col s12 center">
          <SearchBox
            search={this.state.search}
            searchChange={this.searchChange}
          />
        </div>

        <div className="col s12 center">
          {this.state.signatures !== undefined && this.state.count !== undefined ? (
            <span className="grey-text">
              Found {this.state.count}
              {this.state.total_count !== undefined ? ` matches out of ${this.state.total_count} ` : null}
              signatures
              {this.state.duration_meta !== undefined  ? ` in ${this.state.duration_meta.toPrecision(3)} seconds` : null}
            </span>
          ) : null}
        </div>

        <div className="col s12">
          {this.state.signatures !== undefined ? (
            <Signatures
              search={this.state.params.get('q')}
              signatures={this.state.signatures}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
