import React from 'react'
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import dynamic from 'next/dynamic'
import SwipeableViews from 'react-swipeable-views'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TablePagination from '@material-ui/core/TablePagination'

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
      librariescontroller: undefined,
      signaturescontroller: undefined,
      entitiescontroller: undefined,
      library_name: this.props.ui_content.content.library_name,
      index_value: 0,
      signaturesRowsPerPage: 10,
      signaturesPage: 0,
      librariesRowsPerPage: 10,
      librariesPage: 0,
      entitiesRowsPerPage: 10,
      entitiesPage: 0,
    }
    this.performSearch = this.performSearch.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeIndex = this.handleChangeIndex.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
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
      this.setState({
        signaturesPage: 0,
        librariesPage: 0,
        entitiesPage: 0,
      })
    }
  }

  async performSearch(table) {
    if (this.state[`${table}controller`] !== undefined) {
      this.state[`${table}controller`].abort()
    }
    try {
      const controller = new AbortController()
      NProgress.start()
      this.setState({
        status: 'Searching...',
        [table]: undefined,
        [`${table}controller`]: controller,
      })
      const where = build_where(this.props.search)

      const start = Date.now()
      const limit = this.state[`${table}RowsPerPage`]
      const skip = this.state[`${table}RowsPerPage`] * this.state[`${table}Page`]

      const { duration: duration_meta_1, contentRange, response: results } = await fetch_meta_post({
        endpoint: `/${table}/find`,
        body: {
          filter: {
            where,
            limit: limit,
            skip: skip,
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
            'dataset': library_dict[r.library].dataset,
            'meta': {
              [this.state.library_name]: library_dict[r.library].meta[this.state.library_name],
              'Icon': library_dict[r.library].meta['Icon'],
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
      }, () => {
        NProgress.done()
      })
    } catch (e) {
      NProgress.done()
      if (e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + '',
        })
      }
    }
  }

  handleChange(event, newValue) {
    this.setState({
      index_value: newValue,
    })
  }

  handleChangeIndex(index) {
    this.setState({
      index_value: newValue,
    })
  }

  handleChangeRowsPerPage(e, name) {
    this.setState({
      [`${name}RowsPerPage`]: e.target.value,
    }, () => {
      this.performSearch(name)
    })
  }

  handleChangePage(event, page, name) {
    this.setState({
      [`${name}Page`]: page,
    }, () => {
      this.performSearch(name)
    })
  }

  search_div(name, default_name, default_name_singular) {
    return (
      <div>
        <div className="col s12 center">
          {this.state[`${name}_count`] !== undefined ? (
            <div>
              <span className="grey-text">
                Found {this.state[`${name}_count`]}
                {this.props[`${name}_total_count`] !== undefined ? ` matches out of ${this.props[`${name}_total_count`]} ` : null}
                { this.props.ui_content.content.preferred_name[name].toLowerCase() || default_name }
                {this.state[`${name}_duration_meta`] !== undefined ? ` in ${this.state[`${name}_duration_meta`].toPrecision(3)} seconds` : null}
              </span>
            </div>
          ) : null}
        </div>
        <div className="col s12">
          <MetaItem
            search={this.props.search}
            items={this.state[name]}
            type={this.props.ui_content.content.preferred_name_singular[name] || default_name_singular}
            table_name={name}
            preferred_name={this.props.ui_content.content.preferred_name_singular}
            deactivate_download={this.props.ui_content.content.deactivate_download}
            schemas={this.props.schemas}
          />
          <div align="right">
            <TablePagination
              page={this.state[`${name}Page`]}
              rowsPerPage={this.state[`${name}RowsPerPage`]}
              count={this.state[`${name}_count`]}
              onChangePage={(event, page) => this.handleChangePage(event, page, name)}
              onChangeRowsPerPage={(event) => this.handleChangeRowsPerPage(event, name)}
              component="div"
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="col s12">
        <Tabs
          value={this.state.index_value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          centered
        >
          <Tab label={ this.props.ui_content.content.preferred_name['signatures'] || 'Signatures' } />
          <Tab label={ this.props.ui_content.content.preferred_name['libraries'] || 'Libraries' } />
          <Tab label={ this.props.ui_content.content.preferred_name['entities'] || 'Entities' } />
        </Tabs>
        <SwipeableViews
          index={this.state.index_value}
          onChangeIndex={this.handleChangeIndex}
        >
          { this.state.signatures === undefined ? <div /> :
            this.search_div('signatures', 'Signatures', 'Signature')
          }
          { this.state.libraries === undefined ? <div /> :
            this.search_div('libraries', 'Libraries', 'Library')
          }
          { this.state.entities === undefined ? <div /> :
            this.search_div('entities', 'Entities', 'entity')
          }
        </SwipeableViews>
      </div>
    )
  }
}
