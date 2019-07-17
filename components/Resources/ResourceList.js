import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { makeTemplate } from '../../util/makeTemplate'


export default class ResourceList extends React.PureComponent {
  
  componentDidMount(){
    window.scrollTo(0,0)
  }

  render() {
    const sorted_resources = [...this.props.resources].sort((r1, r2) => {
      const r1_name = r1.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, r1)
      const r2_name = r2.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, r2)
      return (r1_name.localeCompare(r2_name))})
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 12

    return (
      <Grid
        container
        direction="row"
      >
        {sorted_resources.map((resource) => (
          <Grid item xs={xs} sm={sm} md={md} key={resource.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, resource)}>
            <Link
              key={resource.id}
              to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}/${resource.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, resource)}`}
            >
              <IconButton
                alt={resource.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, resource)}
                img={resource.meta.icon}
              />
            </Link>
          </Grid>
        ))}
      </Grid>
    )
  }
}
