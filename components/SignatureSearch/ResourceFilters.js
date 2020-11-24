import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { call } from '../../util/call'
import M from 'materialize-css'
import { makeTemplate } from '../../util/makeTemplate'
import CircularProgress from '@material-ui/core/CircularProgress'
import { findMatchedSchema } from '../../util/objectMatch'
import { get_schema_props } from '../Resources'

export default class ResourceFilters extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show_all: false,
    }
  }


  toggle_show_all = () => this.setState({ show_all: !this.state.show_all })

  sort_resources = () => {
    return this.props.resources.sort(
        (r1, r2) => {
          const { name_prop: r1_name_prop } = get_schema_props(r1, this.props.schemas)
          let r1_name = makeTemplate(r1_name_prop, r1)
          if (r1_name === 'undefined') r1_name = r1.id
          const { name_prop: r2_name_prop } = get_schema_props(r2, this.props.schemas)
          let r2_name = makeTemplate(r2_name_prop, r2)
          if (r2_name === 'undefined') r2_name = r2.id
          const diff = (((this.props.resource_signatures || {})[r2_name] || {}).count || 0) - (((this.props.resource_signatures || {})[r1_name] || {}).count || 0)
          if (diff === 0) {
            return r1_name.localeCompare(r2_name)
          } else {
            return diff
          }
        }
    )
  }

  empty_alert() {
    M.toast({
      html: 'There are no matching significant signatures with this resource',
      classes: 'rounded',
      displayLength: 2000,
    })
  }

  render() {
    const sorted_resources = this.sort_resources()
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 12
    if (this.props.loading) {
      return (
        <div style={{ textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )
    } else if (sorted_resources.length === 0) {
      return (
        <span>No results found</span>
      )
    }
    return (
      <Grid
        container
        direction="row"
        alignItems="flex-start"
        ref={(ref) => {
          if (!this.state.resourceAnchor) {
            this.setState({ resourceAnchor: ref })
          }
        }}>
        {sorted_resources.map((resource, ind) => {
          const { name_prop, icon_prop, description_prop } = get_schema_props(resource, this.props.schemas)
          const name = makeTemplate(name_prop, resource)

          const count = ((this.props.resource_signatures || {})[name] || {}).count
          const btn = count === undefined ? (
            <IconButton
              alt={makeTemplate(name_prop, resource)}
              src={`${makeTemplate(icon_prop, resource)}`}
              title={makeTemplate(name_prop, resource)}
              description={makeTemplate(description_prop, resource)}
              counter={count}
              onClick={call(this.empty_alert)}
            />
          ) : (
            <Link
              to={`${this.props.match.url}/${name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={makeTemplate(name_prop, resource)}
                title={makeTemplate(name_prop, resource)}
                src={`${makeTemplate(icon_prop, resource)}`}
                description={makeTemplate(description_prop, resource)}
                counter={count}
              />
            </Link>
          )
          return (
            <Grid item xs={xs} sm={sm} md={md} key={resource.id}>
              {this.state.show_all || ind < this.props.ui_values.maxResourcesToShow || sorted_resources.length < this.props.ui_values.maxResourcesBeforeCollapse ? (
                <div>{btn}</div>
              ) : null}
            </Grid>
          )
        })}
        {sorted_resources.length >= this.props.ui_values.maxResourcesBeforeCollapse ? (
          <Grid item xs={xs} sm={sm} md={md} key={resource.id}>
            <IconButton
              alt={this.state.show_all ? 'Less' : 'More'}
              icon="more_horiz"
              onClick={this.toggle_show_all}
            />
          </Grid>
        ) : null}
      </Grid>
    )
  }
}
