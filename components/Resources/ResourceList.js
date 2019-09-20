import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { makeTemplate } from '../../util/makeTemplate'


export default class ResourceList extends React.PureComponent {
  componentDidMount() {
    window.scrollTo(0, 0)
  }

  render() {
    let { resources } = this.props
    const lib_res = resources.filter(r=>r.is_library)
    const parents = resources.filter(r=>!r.is_library)
    if ( parents.length!==resources.length || lib_res.length !== resources.length){
      resources = parents
    }
    const sorted_resources = [...resources].sort((r1, r2) => {
      let r1_name = r1.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, r1)
      r1_name = r1_name === undefined || r1_name === 'undefined' ? r1.id : r1_name
      let r2_name = r2.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, r2)
      r2_name = r2_name === undefined || r2_name === 'undefined' ? r2.id : r2_name
      return (r1_name.localeCompare(r2_name))
    })
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 12

    return (
      <Grid
        container
        direction="row"
      >
        {sorted_resources.map((resource) => {
          let resource_name = resource.meta.Resource_Name || makeTemplate(this.props.ui_values.resource_name, resource)
          resource_name = resource_name === undefined || resource_name === 'undefined' ? resource.id : resource_name
          return(
            <Grid item xs={xs} sm={sm} md={md} key={resource_name}>
              <Link
                key={resource.id}
                to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}/${resource_name}`}
              >
                <IconButton
                  alt={resource_name}
                  img={resource.meta.icon}
                />
              </Link>
            </Grid>
          )
        })}
      </Grid>
    )
  }
}
