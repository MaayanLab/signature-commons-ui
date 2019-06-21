import React from 'react'
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import dynamic from 'next/dynamic'
import Typography from '@material-ui/core/Typography'
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


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
      library_name: this.props.ui_content.content.library_name,
      index_value: 0
    }
    this.performSearch = this.performSearch.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeIndex = this.handleChangeIndex.bind(this)
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
            limit: 10,
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
          let lib_meta = {"id": library_dict[r.library].id,
                            "dataset": library_dict[r.library].dataset,
                            "meta": {
                              [this.state.library_name]: library_dict[r.library].meta[this.state.library_name],
                              "Icon": library_dict[r.library].meta["Icon"]
                              }
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

  handleChange(event, newValue) {
    this.setState({
      index_value: newValue
    })
  }

  handleChangeIndex(index) {
    this.setState({
      index_value: newValue
    })
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
          { this.state.signatures !== undefined && this.state.signatures_count !== undefined ?
            <Tab label={ this.props.ui_content.content.preferred_name["signatures"] || 'Signatures' } />: null
          }
          { this.state.libraries !== undefined && this.state.libraries_count !== undefined ?
            <Tab label={ this.props.ui_content.content.preferred_name["libraries"] || 'Libraries' } />: null
          }
          { this.state.entities !== undefined && this.state.entities_count !== undefined ?
            <Tab label={ this.props.ui_content.content.preferred_name["entities"] || 'Entities' } />: null
          }
        </Tabs>
        <SwipeableViews
        index={this.state.index_value}
        onChangeIndex={this.handleChangeIndex}
        >
          { this.state.signatures === undefined ? null :
            <div>
              <div className="col s12 center">
                {this.state.signatures_count !== undefined ? (
                  <div>
                    <span className="grey-text">
                      Found {this.state.signatures_count}
                      {this.props.signatures_total_count !== undefined ? ` matches out of ${this.props.signatures_total_count} ` : null}
                      { this.props.ui_content.content.preferred_name["signatures"].toLowerCase() || 'signatures' }
                      {this.state.signatures_duration_meta !== undefined ? ` in ${this.state.signatures_duration_meta.toPrecision(3)} seconds` : null}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="col s12">
                  <MetaItem
                    search={this.props.search}
                    items={this.state.signatures}
                    type={this.props.ui_content.content.preferred_name_singular["signatures"] || 'Signature'}
                  />
              </div>
            </div>
            }
            { this.state.libraries === undefined ? null :
            <div>
              <div className="col s12 center">
                {this.state.libraries_count !== undefined ? (
                  <div>
                    <span className="grey-text">
                      Found {this.state.libraries_count}
                      {this.props.libraries_total_count !== undefined ? ` matches out of ${this.props.libraries_total_count} ` : null}
                      { this.props.ui_content.content.preferred_name["libraries"].toLowerCase() || 'libraries' }
                      {this.state.libraries_duration_meta !== undefined ? ` in ${this.state.libraries_duration_meta.toPrecision(3)} seconds` : null}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="col s12">
                  <MetaItem
                    search={this.props.search}
                    items={this.state.libraries}
                    type={this.props.ui_content.content.preferred_name_singular["libraries"] || 'Library'}
                  />
              </div>
            </div>
            }
            { this.state.entities === undefined ? null :
            <div>
              <div className="col s12 center">
                {this.state.entities_count !== undefined ? (
                  <div>
                    <span className="grey-text">
                      Found {this.state.entities_count}
                      {this.props.entities_total_count !== undefined ? ` matches out of ${this.props.entities_total_count} ` : null}
                      { this.props.ui_content.content.preferred_name["entities"].toLowerCase() || 'entities' }
                      {this.state.entities_duration_meta !== undefined ? ` in ${this.state.entities_duration_meta.toPrecision(3)} seconds` : null}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="col s12">
                  <MetaItem
                    search={this.props.search}
                    items={this.state.entities}
                    type={this.props.ui_content.content.preferred_name_singular["entities"] || 'Entity'}
                  />
              </div>
            </div>
            }
        </SwipeableViews>
      </div>
    )
  }
}
