import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import config from '../../ui-schemas/SignatureSearch.json'
import { call } from '../../util/call'
import M from 'materialize-css'

export default class ResourceFilters extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show_all: false,
    }
  }

  toggle_show_all = () => this.setState({ show_all: !this.state.show_all })

  sort_resources() {
    return [...this.props.resources].sort(
        (r1, r2) => {
          const diff = (((this.props.resource_signatures || {})[r2.meta.Resource_Name] || {}).count || 0) - (((this.props.resource_signatures || {})[r1.meta.Resource_Name] || {}).count || 0)
          if (diff === 0) {
            return r1.meta.Resource_Name.localeCompare(r2.meta.Resource_Name)
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
          const count = ((this.props.resource_signatures || {})[resource.meta.Resource_Name] || {}).count
          const btn = count === undefined ? (
            <IconButton
              alt={resource.meta.Resource_Name}
              img={resource.meta.icon}
              counter={count}
              onClick={call(this.empty_alert)}
            />
          ) : (
            <Link
              to={`${this.props.match.url}/${resource.meta.Resource_Name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={resource.meta.Resource_Name}
                img={resource.meta.icon}
                counter={count}
              />
            </Link>
          )
          return (
            <Grid item xs={xs} sm={sm} md={md} key={resource.id}>
              {this.state.show_all || ind < config.maxResourcesToShow || sorted_resources.length < config.maxResourcesBeforeCollapse ? (
                <div>{btn}</div>
              ) : null}
            </Grid>
          )
        })}
        {sorted_resources.length >= config.maxResourcesBeforeCollapse ? (
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
