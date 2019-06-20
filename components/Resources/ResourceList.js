import React from 'react'
import { Link } from 'react-router-dom'
import IconButton from '../../components/IconButton'

export default class ResourceList extends React.PureComponent {
  render() {
    const sorted_resources = [...this.props.resources].sort((r1, r2) => r1.meta.name.localeCompare(r2.meta.name))
    return (
      <div className="row">
        <div className="col offset-s2 s8">
          {sorted_resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/${this.props.ui_content.content.change_resource || 'Resources'}/${resource.meta.name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={resource.meta.name}
                img={resource.meta.icon}
                style={this.props.ui_content.content.resource_list_style}
              />
            </Link>
          ))}
        </div>
      </div>
    )
  }
}
