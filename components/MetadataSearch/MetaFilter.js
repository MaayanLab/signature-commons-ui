import React from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { findMatchedSchema } from '../../util/ui/objectMatch'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { ReadURLParams, URLFormatter } from '../../util/helper/misc'
import Filter from './Filter'

const mapStateToProps = (state) => {
  return {
    parent_ids_mapping: state.parent_ids_mapping,
    models: state.models,
    parents: state.parents_mapping,
    completed: state.completed,
    reverse_preferred_name: state.reverse_preferred_name,
    preferred_name: state.ui_values.preferred_name,
    MetadataSearchNav: state.ui_values.nav.MetadataSearch || {},
  }
}

class MetaFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data_count: [],
      selected: {},
      mapping_id_to_name: undefined,
      mapping_name_to_id: undefined,
      grandparent_mapping_id_to_name: undefined,
      grandparent_mapping_name_to_id: undefined,
    }
  }

  getGrandparentMeta = () => {
    const { current_table, grandparent_mapping_id_to_name, grandparent_mapping_name_to_id } = this.state
    const curr_table = this.props.reverse_preferred_name[this.props.match.params.table]
    const model = this.props.models[curr_table]
    if (model.grandparents_meta === undefined) return {}

    if (curr_table === current_table &&
        grandparent_mapping_id_to_name !== undefined &&
        grandparent_mapping_name_to_id !== undefined) {
      return { grandparent_mapping_name_to_id, grandparent_mapping_id_to_name }
    } else {
      const { schemas } = this.props
      const grandparents_ids_mapping = model.grandparents_meta
      const grandparent_mapping_id_to_name = {}
      const grandparent_mapping_name_to_id = {}
      for (const [id, val] of Object.entries(grandparents_ids_mapping)) {
        const matched_schema = findMatchedSchema(val, schemas)
        const name_prop = Object.keys(matched_schema.properties).filter((prop) => matched_schema.properties[prop].name)
        let name
        if (name_prop.length > 0) {
          name = makeTemplate(matched_schema.properties[name_prop[0]].text, val)
          if (name === 'undefined') {
            console.log(matched_schema)
            console.log(val)
            name = id
          }
        } else {
          console.warn('source of resource name is not defined, using either Name or ids')
          name = resource.meta['Name'] || id
        }
        grandparent_mapping_id_to_name[id] = name
        grandparent_mapping_name_to_id[name] = id
      }
      this.setState({
        grandparent_mapping_id_to_name,
        grandparent_mapping_name_to_id,
      })
      return { grandparent_mapping_name_to_id, grandparent_mapping_id_to_name }
    }
  }

  getParentMeta = () => {
    const { current_table, mapping_id_to_name, mapping_name_to_id } = this.state
    const curr_table = this.props.reverse_preferred_name[this.props.match.params.table]
    if (curr_table === current_table && mapping_id_to_name !== undefined && mapping_name_to_id !== undefined) {
      return { mapping_name_to_id, mapping_id_to_name }
    } else {
      const { schemas, models } = this.props

      const model = models[curr_table]
      const parent_ids_mapping = model.parents_meta
      let mapping_id_to_name = {}
      const mapping_name_to_id = Object.entries(parent_ids_mapping).reduce((acc, [id, val]) => {
        const matched_schema = findMatchedSchema(val, schemas)
        const name_prop = Object.keys(matched_schema.properties).filter((prop) => matched_schema.properties[prop].name)
        let name
        if (name_prop.length > 0) {
          name = makeTemplate(matched_schema.properties[name_prop[0]].text, val)
          if (name === 'undefined') {
            console.log(matched_schema)
            console.log(val)
            name = id
          }
        } else {
          console.warn('source of resource name is not defined, using either Name or ids')
          name = resource.meta['Name'] || id
        }
        mapping_id_to_name = {
          ...mapping_id_to_name,
          [id]: name,
        }
        acc = {
          ...acc,
          [name]: id,
        }
        return acc
      }, {})
      this.setState({
        mapping_id_to_name,
        mapping_name_to_id,
        current_table,
      })
      return { mapping_name_to_id, mapping_id_to_name }
    }
  }

  getDataCounts = (stats) => {
    const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
    const curr_table = this.props.reverse_preferred_name[current_table]
    const param_str = this.props.location.search
    const params = ReadURLParams(param_str, this.props.reverse_preferred_name)
    let selected_values = []
    const selected = {}
    let data_count = []
    if (params[curr_table] !== undefined && params[curr_table].filters !== undefined && params[curr_table].filters[this.props.field_name] !== undefined) {
      selected_values = params[curr_table].filters[this.props.field_name]
    }
    if (this.props.parent) {
      const { mapping_id_to_name } = this.getParentMeta()
      for (const [id, count] of Object.entries(stats)) {
        if (id !== null && count > 0) {
          const name = mapping_id_to_name[id]
          selected[name] = selected_values.indexOf(id) > -1
          data_count = [...data_count, { count, name, id }]
        }
      }
    } else if (this.props.grandparent) {
      const { grandparent_mapping_id_to_name } = this.getGrandparentMeta()
      for (const [id, count] of Object.entries(stats)) {
        if (id !== null && count > 0) {
          const name = grandparent_mapping_id_to_name[id]
          selected[name] = selected_values.indexOf(id) > -1
          data_count = [...data_count, { count, name, id }]
        }
      }
    } else {
      for (const [name, count] of Object.entries(stats)) {
        if (count > 0) {
          selected[name] = selected_values.indexOf(name) > -1
          data_count = [...data_count, { count, name }]
        }
      }
    }
    this.setState({
      selected,
      data_count,
    })
  }

  componentDidMount() {
    this.getDataCounts(this.props.stats)
  }

  componentDidUpdate(prevProps) {
    const prevTable = prevProps.match.params.table
    const current_table = this.props.match.params.table
    if (prevTable !== current_table) {
      this.getDataCounts(this.props.stats)
    } else if (!prevProps.completed && this.props.completed) {
      this.getDataCounts(this.props.stats)
    }
  }

  toggleSelect = (name) => {
    let selected_values = []
    let selected
    if (this.props.parent) {
      const {
        mapping_name_to_id,
      } = this.state
      selected = {
        ...this.state.selected,
        [name]: !this.state.selected[name],
      }
      for (const [name, val] of Object.entries(selected)) {
        if (val) {
          selected_values = [...selected_values, mapping_name_to_id[name]]
        }
      }
    } else if (this.props.grandparent) {
      const {
        grandparent_mapping_name_to_id,
      } = this.state
      selected = {
        ...this.state.selected,
        [name]: !this.state.selected[name],
      }
      for (const [name, val] of Object.entries(selected)) {
        if (val) {
          selected_values = [...selected_values, grandparent_mapping_name_to_id[name]]
        }
      }
    } else {
      selected = {
        ...this.state.selected,
        [name]: !this.state.selected[name],
      }
      for (const [name, val] of Object.entries(selected)) {
        if (val) {
          selected_values = [...selected_values, name]
        }
      }
    }
    this.setState({
      selected,
    }, () => {
      const current_table = this.props.match.params.table || this.props.preferred_name['signatures'] || this.props.preferred_name['libraries']
      const curr_table = this.props.reverse_preferred_name[current_table]
      const param_str = this.props.location.search
      let params = ReadURLParams(param_str, this.props.reverse_preferred_name)
      let filters = {}
      if (params[curr_table] !== undefined) {
        filters = {
          ...params[curr_table].filters,
          [this.props.field_name]: selected_values.length > 0 ? selected_values : undefined,
        }
      } else {
        filters = {
          [this.props.field_name]: selected_values.length > 0 ? selected_values : undefined,
        }
      }
      params = {
        ...params,
        [curr_table]: {
          ...params[curr_table],
          filters,
          skip: undefined,
          limit: undefined,
        },
      }
      const query = URLFormatter({ params, preferred_name: this.props.preferred_name })
      this.props.history.push({
        pathname: `${this.props.MetadataSearchNav.endpoint || '/MetadataSearch'}/${current_table}`,
        search: `?query=${query}`,
        state: {
          new_search: false,
          pagination: false,
          new_filter: true,
        },
      })
    })
  }

  render = () => {
    return (
      <Filter
        {...this.state}
        loaded={this.props.completed || this.props.pagination}
        toggleSelect={this.toggleSelect}
      />
    )
  }
}

MetaFilter.propTypes = {
  stats: PropTypes.object,
  parent: PropTypes.bool,
  field_name: PropTypes.string,
}

export default withRouter(connect(mapStateToProps)(MetaFilter))
