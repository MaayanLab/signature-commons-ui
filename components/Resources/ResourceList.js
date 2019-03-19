import React from 'react'
import { Link } from 'react-router-dom'
import IconButton from '../../components/IconButton';

export default class ResourceList extends React.PureComponent {
  render() {
    const sorted_resources = [...this.props.resources].sort((r1, r2) => r1.name.localeCompare(r2.name))
    return (
      <div className="row">
        <div className="col offset-s2 s8">
          {sorted_resources.map((resource) => (
            <Link
              key={resource.name}
              to={`/Resources/${resource.name.replace(/ /g, '_')}`}
            >
              <IconButton
                alt={resource.name}
                img={resource.icon}
              />
            </Link>
          ))}
        </div>
      </div>
    )
  }
}