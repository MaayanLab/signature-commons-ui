import React from 'react'

import TablePagination from '@material-ui/core/TablePagination'

import { makeTemplate, makeTemplateForObject } from '../../util/makeTemplate'
import { findMatchedSchema, objectMatch } from '../../util/objectMatch'
import { connect } from 'react-redux'
import { URLFormatter, ReadURLParams } from '../../util/helper/misc'
import DataTable from './DataTable'
import { ExpandedMeta } from './ExpandedMeta'

export const value_by_type = {
  'text': ({ label, prop, data }) => {
    const val = makeTemplate(prop.text, data)
    let hyperlink
    if (prop.hyperlink !== undefined){
      hyperlink = makeTemplate(prop.hyperlink, data)
    } 
    if (val === 'undefined') {
      return null
    } else {
      return { text: val, hyperlink, label }
    } 
  },
  'img': ({ label, prop, data }) => {
    const src = makeTemplate(prop.src, data)
    const alt = makeTemplate(prop.alt, data)
    let text = makeTemplate(prop.text, data)
    let hyperlink
    if (prop.hyperlink !== undefined) hyperlink = makeTemplate(prop.hyperlink, data)
    if (alt === 'undefined') {
      return null
    } else {
      if (text === 'undefined') text = alt
      return { label, alt, src, text, hyperlink }
    }
  },
  'object': ({ label, prop, data }) => {
    if (prop.keywords){
      const val = makeTemplateForObject("${JSON.stringify("+ prop.Field_Name +")}", data, prop.text)
      if (val === 'undefined' || val.length === 0) {
        return null
      } else {
        return { object: val, label }
      }
    }else {
      const val = makeTemplateForObject("${JSON.stringify("+ prop.Field_Name +")}", data, prop.text)
      if (val === 'undefined' || val.length === 0) {
        return null
      } else {
        return { text: val, label }
      }
    }
  },
  'list': ({ label, prop, data }) => {
    const val = makeTemplateForObject(prop.text, data, prop.subtext || null)
    if (val === 'undefined' || val.length === 0) {
      return null
    } else {
      return { list: val, label }
    }
  }
}

export const get_card_data = (data, schemas, highlight = undefined) => {
  const schema = findMatchedSchema(data, schemas)
  if (schema !== null) {
    const { properties } = schema
    const scores = {}
    let tags = []
    let download = []
    let keywords = {}
    const processed = { id: data.id, display: {} }
    const sort_tags = {}
    for (const label of Object.keys(properties)) {
      const prop = properties[label]

      if (prop.visibility && prop.visibility > 0 && objectMatch(prop.condition, data)){
        const val = value_by_type[prop.type]({ label, prop, data, highlight })
        if (prop.name) {
          processed.name = { text: data.id }
          if (val !== null) {
            processed.name = { ...processed.name, ...val }
          }
        }
        if (prop.subtitle) {
          if (val !== null) processed.subtitle = { ...val }
        }
        if (prop.display) {
          if (val !== null) processed.display[label] = { ...val }
        }
        if (prop.icon) {
          if (val !== null) {
            processed.icon = { ...val }
          }
        }
        if (prop.homepage){
          console.log(val)
          processed.homepage = { ...val }
        }
        if (prop.download) {
          if (val !== null) {
            download = [
              ...download,
              { 
                ...val,
                icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
                priority: prop.priority,
              }
            ]
          }
        }
        if (prop.score) {
          if (val !== null) {
            scores[prop.Field_Name] = {
              label,
              value: val.text,
              field_name: prop.Field_Name,
              icon: prop.MDI_Icon || 'mdi-star',
            }
            sort_tags[prop.Field_Name] = {
              label,
              field_name: prop.Field_Name,
              icon: prop.MDI_Icon || 'mdi-star',
            }
          }
        }
        if (prop.keywords) {
          // TODO: Update schemas so it has list
          if (val !== null){
            keywords[label] = {
              label,
              value : val.object,
              icon: prop.MDI_Icon || 'mdi-tag-multiple'
            }
          }
        }
        if (!(prop.score || prop.icon || prop.name || prop.subtitle || prop.display || prop.keywords || prop.download || prop.homepage)) {
          if (val !== null) {
            tags = [...tags, {
              ...val,
              icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
              priority: prop.priority,
              clickable: prop.clickable
            }]
          }
        }
      }
    }
    tags = tags.sort((a, b) => a.priority - b.priority)
    if (Object.keys(scores).length > 0) processed.scores = scores
    processed.tags = tags || []
    processed.download = download || []
    processed.keywords = keywords
    return { original: data, processed, sort_tags }
  }
}

const mapStateToProps = (state) => {
  return {
    search: state.search,
    models: state.models,
    ui_values: state.ui_values,
    loading: state.loading,
    completed: state.completed,
    paginating: state.paginating,
    reverse_preferred_name: state.reverse_preferred_name,
    preferred_name: state.ui_values.preferred_name,
    preferred_name_singular: state.ui_values.preferred_name_singular,
    deactivate_download: state.ui_values.deactivate_download,
    MetadataSearchNav: state.ui_values.nav.MetadataSearch || {},
  }
}

class MetadataSearchResults extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collection: [],
      sorted: null,
      page: 0,
      perPage: 10,
      order: props.order,
      sort_tags: {},
    }
  }

  componentDidMount = () => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    if (this.props.models[current_table]) {
      const coll = this.props.models[current_table].results.metadata_search || []
      let sort_tags = this.state.sort_tags
      const collection = coll.map((data) => {
        const { original, processed, sort_tags: tags } = get_card_data(data, this.props.schemas)
        sort_tags = {
          ...sort_tags,
          ...tags,
        }
        return { original, processed }
      })
      this.setState({
        collection,
        current_table,
        sort_tags,
      })
    }
  }

  sortBy = (sorted) => {
    const curr_table = this.props.reverse_preferred_name[this.props.match.params.table]
    if (this.props.order[curr_table] !== sorted) {
      this.setState({
        order: {
          ...this.props.order,
          [curr_table]: sorted,
        },
      }, () => {
        const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
        const curr_table = this.props.reverse_preferred_name[current_table]
        const param_str = this.props.location.search
        let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
        params = {
          ...params,
          [curr_table]: {
            ...params[curr_table],
            order: sorted,
            limit: undefined,
            skip: undefined,
          },
        }
        const query = URLFormatter({ params, preferred_name: this.props.preferred_name })
        this.props.history.push({
          pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
          search: `?q=${query}`,
          state: {
            order: true,
          },
        })
      })
    }
    // const collection = this.props.collection
    // collection = collection.sort((a, b) => a.processed.scores[sorted].value - b.processed.scores[sorted].value)
    // this.setState({
    //   collection,
    //   sorted,
    // })
  }

  onChipClick = (value) => {
    const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
    const param_str = this.props.location.search
    let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    const { search, ...rest } = params
    for (const i in rest) {
      rest[i] = {
        ...rest[i],
        limit: undefined,
        skip: undefined,
      }
    }
    params = {
      search: [...search, value],
      ...rest,
    }
    const query = URLFormatter({ params, preferred_name: this.props.preferred_name })
    this.props.history.push({
      pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
      search: `?q=${query}`,
      state: {
        new_search: true,
        pagination: false,
        new_filter: false,
      },
    })
  }

  handleChangeRowsPerPage = (e) => {
    this.setState({
      perPage: e.target.value,
    }, () => {
      const { page, perPage } = this.state
      const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
      const curr_table = this.props.reverse_preferred_name[current_table]
      const param_str = this.props.location.search
      let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      params = {
        ...params,
        [curr_table]: {
          ...params[curr_table],
          limit: perPage,
          skip: page * perPage,
        },
      }
      const query = URLFormatter({ params, preferred_name: this.props.preferred_name })
      this.props.history.push({
        pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
        search: `?q=${query}`,
        state: {
          new_search: false,
          pagination: true,
          new_filter: false,
        },
      })
    })
  }

  handleChangePage = (event, page) => {
    this.setState({
      page,
    }, () => {
      const { page, perPage } = this.state
      const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
      const curr_table = this.props.reverse_preferred_name[current_table]
      const param_str = this.props.location.search
      let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      params = {
        ...params,
        [curr_table]: {
          ...params[curr_table],
          limit: perPage,
          skip: page * perPage,
        },
      }
      const query = URLFormatter({ params, preferred_name: this.props.preferred_name })
      this.props.history.push({
        pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
        search: `?q=${query}`,
        state: {
          new_search: false,
          pagination: true,
          new_filter: false,
        },
      })
    })
  }


  componentDidUpdate = (prevProps) => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    const old_table = this.props.reverse_preferred_name[prevProps.match.params.table]
    let page = this.state.page
    let perPage = this.state.perPage
    if (this.props.models[current_table] !== undefined) {
      const limit = this.props.models[current_table].pagination.limit
      const skip = this.props.models[current_table].pagination.skip || 0
      page = skip / limit
      perPage = limit
    }
    if (page !== this.state.page || perPage !== this.state.perPage) {
      this.setState({
        page,
        perPage,
      })
    }
    if (current_table !== old_table) {
      const c = this.props.models[current_table].results.metadata_search || []
      const collection = c.map((data) => get_card_data(data, this.props.schemas))
      this.setState({
        collection,
        current_table,
      })
    }
    if (prevProps.completed === false && this.props.completed === true) {
      const c = this.props.models[current_table].results.metadata_search || []
      const collection = c.map((data) => get_card_data(data, this.props.schemas))
      this.setState({
        collection,
        current_table,
      })
    }
  }

  render = () => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]
    const model = this.props.models[current_table]
    return (
      <React.Fragment>
        <DataTable schemas={this.props.schemas}
          ui_values={this.props.ui_values}
          {...this.state}
          loaded={this.props.completed && !this.props.loading && !this.props.paginating}
          sortBy={this.sortBy}
          sorted={this.props.order[current_table]}
          onChipClick={this.onChipClick}
          current_table={current_table}
          type={this.props.preferred_name_singular[this.props.reverse_preferred_name[this.props.match.params.table]]}
          history={this.props.history}
          search={this.props.search}
          sort_tags={this.state.sort_tags}
          deactivate_download={this.props.deactivate_download}
          expandRenderer={(props)=>ExpandedMeta(props)}
        />
        <div align="right">
          <TablePagination
            page={this.state.page}
            rowsPerPage={this.state.perPage}
            count={ model !== undefined ? model.results.count || 0 : 0}
            onChangePage={(event, page) => this.handleChangePage(event, page)}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            component="div"
          />
        </div>
      </React.Fragment>
    )
  }
}

export default connect(mapStateToProps)(MetadataSearchResults)
