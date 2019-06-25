import React from 'react'
import { Link } from 'react-router-dom'
import IconButton from '../../components/IconButton'

export default class ResourceList extends React.PureComponent {
  render() {
    const sorted_resources = [...this.props.resources].sort((r1, r2) => r1.meta.Resource_Name.localeCompare(r2.meta.Resource_Name))
    return (
      <div className="row">
        <div className="col offset-s2 s8">
          {sorted_resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/${this.props.ui_content.content.change_resource || 'Resources'}/${resource.meta.Resource_Name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={resource.meta.Resource_Name}
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
