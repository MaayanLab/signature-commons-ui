import React from 'react'
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import dynamic from 'next/dynamic'

const Signatures = dynamic(() => import('../../components/MetadataSearch/Signatures'))

function build_where(q) {
  if (q.indexOf(':') !== -1) {
    const [key, ...value] = q.split(':')
    return {
      ['meta.' + key]: {
        ilike: '%' + value.join(':') + '%',
      },
    }
  } else {
    return {
      meta: {
        fullTextSearch: q,
      },
    }
  }
}

export default class SearchResults extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      controller: undefined,
    }
    this.performSearch = this.performSearch.bind(this)
  }

  componentDidMount() {
    this.performSearch()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.search !== this.props.search) {
      this.performSearch()
    }
  }

  async performSearch() {
    if (this.state.controller !== undefined) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      NProgress.start()
      this.setState({
        status: 'Searching...',
        signatures: undefined,
        controller,
      })

      const where = build_where(this.props.search)

      const start = Date.now()
      const { duration: duration_meta_1, contentRange, response: signatures } = await fetch_meta_post({
        endpoint: '/signatures/find',
        body: {
          filter: {
            where,
            limit: 20,
          },
        },
        signal: controller.signal,
      })

      const library_ids = [...new Set(signatures.map((sig) => sig.library))]
      const { duration: duration_meta_2, response: libraries } = await fetch_meta_post({
        endpoint: '/libraries/find',
        body: {
          filter: {
            where: {
              id: {
                inq: library_ids,
              },
            },
          },
        },
        signal: controller.signal,
      })

      const duration_meta = duration_meta_1 + duration_meta_2

      const library_dict = libraries.reduce((L, l) => ({ ...L, [l.id]: l }), {})

      for (const signature of signatures) {
        signature.library = library_dict[signature.library]
      }

      this.setState({
        signatures,
        status: '',
        duration: (Date.now() - start) / 1000,
        duration_meta,
        count: contentRange.count,
      }, () => NProgress.done())
    } catch (e) {
      NProgress.done()
      if (e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + '',
        })
      }
    }
  }

  render() {
    return (
      <div className="col s12">
        <div className="col s12 center">
          {this.state.signatures !== undefined && this.state.count !== undefined ? (
            <span className="grey-text">
              Found {this.state.count}
              {this.props.total_count !== undefined ? ` matches out of ${this.props.total_count} ` : null}
              signatures
              {this.state.duration_meta !== undefined ? ` in ${this.state.duration_meta.toPrecision(3)} seconds` : null}
            </span>
          ) : null}
        </div>

        <div className="col s12">
          {this.state.signatures !== undefined ? (
            <Signatures
              search={this.props.search}
              signatures={this.state.signatures}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
