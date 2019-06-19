import React from 'react'
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import dynamic from 'next/dynamic'
import Typography from '@material-ui/core/Typography'


const MetaItem = dynamic(() => import('../../components/MetadataSearch/MetaItem'))

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
    this.performSearch('signatures')
    this.performSearch('libraries')
    this.performSearch('entities')
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.search !== this.props.search) {
      this.performSearch('signatures')
      this.performSearch('libraries')
      this.performSearch('entities')
    }
  }

  async performSearch(table) {
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
      const { duration: duration_meta_1, contentRange, response: results } = await fetch_meta_post({
        endpoint: `/${table}/find`,
        body: {
          filter: {
            where,
            limit: 5,
          },
        },
        signal: controller.signal,
      })
      let duration_meta = duration_meta_1
      if (table === 'signatures') {
        const library_ids = [...new Set(results.map((sig) => sig.library))]
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
        duration_meta = duration_meta_1 + duration_meta_2
        const library_dict = libraries.reduce((L, l) => ({ ...L, [l.id]: l }), {})
        for (const r of results) {
          const lib_meta = { 'id': library_dict[r.library].id,
            'meta': {
              'Library_name': library_dict[r.library].meta.Library_name,
            },
          }
          r.library = lib_meta
        }
      }
      const duration_label = table + '_duration'
      const duration_meta_label = table + '_duration_meta'
      const count_label = table + '_count'
      this.setState({
        [table]: results,
        status: '',
        [duration_label]: (Date.now() - start) / 1000,
        [duration_meta_label]: duration_meta,
        [count_label]: contentRange.count,
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
          {this.state.signatures !== undefined && this.state.signatures_count !== undefined ? (
            <div>
              <Typography variant="title">
                { 'Signatures' }
              </Typography>
              <span className="grey-text">
                Found {this.state.signatures_count}
                {this.props.signatures_total_count !== undefined ? ` matches out of ${this.props.signatures_total_count} ` : null}
                signatures
                {this.state.signatures_duration_meta !== undefined ? ` in ${this.state.signatures_duration_meta.toPrecision(3)} seconds` : null}
              </span>
            </div>
          ) : null}
        </div>

        <div className="col s12">
          {this.state.signatures !== undefined ? (
            <MetaItem
              search={this.props.search}
              items={this.state.signatures}
              type={'Signature'}
            />
          ) : null}
        </div>

        <div className="col s12 center">
          {this.state.libraries !== undefined && this.state.libraries_count !== undefined ? (
            <div>
              <Typography variant="title">
                { 'Libraries' }
              </Typography>
              <span className="grey-text">
                Found {this.state.libraries_count}
                {this.props.libraries_total_count !== undefined ? ` matches out of ${this.props.libraries_total_count} ` : null}
                libraries
                {this.state.libraries_duration_meta !== undefined ? ` in ${this.state.libraries_duration_meta.toPrecision(3)} seconds` : null}
              </span>
            </div>
          ) : null}
        </div>

        <div className="col s12">
          {this.state.libraries !== undefined ? (
            <MetaItem
              search={this.props.search}
              items={this.state.libraries}
              type={'Library'}
            />
          ) : null}
        </div>

        <div className="col s12 center">
          {this.state.entities !== undefined && this.state.entities_count !== undefined ? (
            <div>
              <Typography variant="title">
                { 'Entities' }
              </Typography>
              <span className="grey-text">
                Found {this.state.entities_count}
                {this.props.entities_total_count !== undefined ? ` matches out of ${this.props.entities_total_count} ` : null}
                entities
                {this.state.entities_duration_meta !== undefined ? ` in ${this.state.entities_duration_meta.toPrecision(3)} seconds` : null}
              </span>
            </div>
          ) : null}
        </div>

        <div className="col s12">
          {this.state.entities !== undefined ? (
            <MetaItem
              search={this.props.search}
              items={this.state.entities}
              type={'Entity'}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
