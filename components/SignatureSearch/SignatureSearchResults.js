import React from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'

export default class extends React.Component {
  
  render() {
    return (
      <div>
        {this.state.resources.length <= 0 ? null : (
          <div ref={(ref) => {
            if (!this.state.resourceAnchor)
              this.setState({ resourceAnchor: ref })
          }} className="col s12 center">
            {sorted_resources.filter(
              (resource) => {
                if (this.state.up_down)
                  return primary_two_tailed_resources.indexOf(resource.name) !== -1
                else
                  return primary_resources.indexOf(resource.name) !== -1
              }
            ).map((resource) => (
              <div
                key={resource.name}
              >
                <IconButton
                  alt={resource.name}
                  img={resource.icon}
                  onClick={() => this.setState({ resource_filter: resource }, () => this.submit())}
                  counter={((this.state.resource_signatures || {})[resource.name] || {}).count}
                />
              </div>
            ))}
            {this.state.up_down ? null : (
              <div>
                {!this.state.show_all ? null : sorted_resources.filter(
                  (resource) => primary_resources.indexOf(resource.name) === -1
                ).map((resource) => (
                  <IconButton
                    key={resource.name}
                    alt={resource.name}
                    img={resource.icon}
                    onClick={() => this.setState({ resource_filter: resource }, () => this.submit())}
                    counter={((this.state.resource_signatures || {})[resource.name] || {}).count}
                  />
                ))}
                <IconButton
                  alt={this.state.show_all ? "Less": "More"}
                  icon={'more_horiz'}
                  onClick={() => this.setState(({show_all}) => ({ show_all: !show_all }))}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}