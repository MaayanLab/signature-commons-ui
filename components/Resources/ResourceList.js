import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'

export default class ResourceList extends React.PureComponent {
  render() {
    const sorted_resources = [...this.props.resources].sort((r1, r2) => r1.meta.Resource_Name.localeCompare(r2.meta.Resource_Name))
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 12
    return (
      <Grid
        container
        direction="row"
      >
        {sorted_resources.map((resource) => (
          <Grid item xs={xs} sm={sm} md={md} key={resource.meta.Resource_Name}>
            <Link
              key={resource.id}
              to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}/${resource.meta.Resource_Name}`}
            >
              <IconButton
                alt={resource.meta.Resource_Name}
                img={resource.meta.icon}
              />
            </Link>
          </Grid>
        ))}
      </Grid>
    )
  }
}
