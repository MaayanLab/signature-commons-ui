import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { call } from '../../util/call'
import M from 'materialize-css'
import { makeTemplate } from '../../util/makeTemplate'
import CircularProgress from '@material-ui/core/CircularProgress'
import { findMatchedSchema } from '../../util/objectMatch'

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
          const schema_r1 = findMatchedSchema(r1, this.props.schemas)
          const name_props_r1 = Object.values(schema_r1.properties).filter((prop) => prop.name)
          const name_prop_r1 = name_props_r1.length > 0 ? name_props_r1[0].text : '${id}'
          const name_r1 = makeTemplate(name_prop_r1, r1)
          const schema_r2 = findMatchedSchema(r2, this.props.schemas)
          const name_props_r2 = Object.values(schema_r2.properties).filter((prop) => prop.name)
          const name_prop_r2 = name_props_r2.length > 0 ? name_props_r2[0].text : '${id}'
          const name_r2 = makeTemplate(name_prop_r2, r2)

          const diff = (((this.props.resource_signatures || {})[name_r2] || {}).count || 0) - (((this.props.resource_signatures || {})[name_r1] || {}).count || 0)
          if (diff === 0) {
            return name_r1.localeCompare(name_r2)
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
        ref={(ref) => {
          if (!this.state.resourceAnchor) {
            this.setState({ resourceAnchor: ref })
          }
        }}>
        {sorted_resources.map((resource, ind) => {
          const schema = findMatchedSchema(resource, this.props.schemas)
          const name_props = Object.values(schema.properties).filter((prop) => prop.name)
          const name_prop = name_props.length > 0 ? name_props[0].text : '${id}'
          const name = makeTemplate(name_prop, resource)
          
          const count = ((this.props.resource_signatures || {})[name] || {}).count
          const btn = count === undefined ? (
            <IconButton
              alt={makeTemplate(this.props.name_prop, resource)}
              src={`${makeTemplate(this.props.icon_prop, resource)}`}
              title={makeTemplate(this.props.name_prop, resource)}
              description={makeTemplate(this.props.description_prop, resource)}
              counter={count}
              onClick={call(this.empty_alert)}
            />
          ) : (
            <Link
              to={`${this.props.match.url}/${name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={makeTemplate(this.props.name_prop, resource)}
                title={makeTemplate(this.props.name_prop, resource)}
                src={`${makeTemplate(this.props.icon_prop, resource)}`}
                description={makeTemplate(this.props.description_prop, resource)}
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
