import React from 'react'
import { Link } from 'react-router-dom'
import IconButton from '../../components/IconButton'
import config from '../../ui-schemas/SignatureSearch.json'
import { call } from '../../util/call'
import M from 'materialize-css'

export default class extends React.Component {
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
          const diff = (((this.props.resource_signatures || {})[r2.id] || {}).count || 0) - (((this.props.resource_signatures || {})[r1.id] || {}).count || 0)
          if (diff === 0) {
            return r1.meta.name.localeCompare(r2.meta.name)
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

    return (
      <div ref={(ref) => {
        if (!this.state.resourceAnchor) {
          this.setState({ resourceAnchor: ref })
        }
      }} className="col s12 center">
        {sorted_resources.map((resource, ind) => {
          const count = ((this.props.resource_signatures || {})[resource.meta.name] || {}).count
          const btn = count === undefined ? (
            <IconButton
              alt={resource.meta.name}
              img={resource.meta.icon}
              counter={count}
              onClick={call(this.empty_alert)}
            />
          ) : (
            <Link
              to={`${this.props.match.url}/${resource.meta.name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={resource.meta.name}
                img={resource.meta.icon}
                counter={count}
              />
            </Link>
          )
          return (
            <div key={resource.id}>
              {this.state.show_all || ind < config.maxResourcesToShow || sorted_resources.length < config.maxResourcesBeforeCollapse ? (
                <div>{btn}</div>
              ) : null}
            </div>
          )
        })}
        {sorted_resources.length >= config.maxResourcesBeforeCollapse ? (
          <IconButton
            alt={this.state.show_all ? 'Less': 'More'}
            icon="more_horiz"
            onClick={this.toggle_show_all}
          />
        ) : null}
      </div>
    )
  }
}
