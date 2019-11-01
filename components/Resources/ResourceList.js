import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { makeTemplate } from '../../util/makeTemplate'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'

const mapStateToProps = (state, ownProps) => {
  const { ui_values, schemas } = state.serverSideProps
  return {
    ui_values,
    schemas,
  }
}

class ResourceList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sorted_resources: [],
      schema: null,
    }
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const sorted_resources = Object.values(this.props.resources).sort((r1, r2) => {
      let r1_name = makeTemplate(this.props.name_prop, r1)
      if (r1_name === 'undefined') r1_name = r1.id
      let r2_name = makeTemplate(this.props.name_prop, r2)
      if (r2_name === 'undefined') r2_name = r2.id
      return (r1_name.localeCompare(r2_name))
    })
    this.setState({
      sorted_resources,
    })
  }

  render() {
    const { icon_prop,
      name_prop,
      description_prop } = this.props
    const sorted_resources = this.state.sorted_resources
    if (sorted_resources.length === 0) {
      return <CircularProgress />
    }
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 12

    return (
      <Grid
        container
        direction="row"
        alignItems="center"
      >
        {sorted_resources.map((resource) => {
          let name = makeTemplate(name_prop, resource)
          if (name==='undefined') name = resource.id
          return (
            <Grid item xs={xs} sm={sm} md={md}
              style={{ textAlign: 'center' }}
              key={name}>
              <Link
                key={resource.id}
                to={`${this.props.ui_values.nav.Resources.endpoint}/${ name.replace(/ /g, '_')}`}
              >
                <IconButton
                  alt={name}
                  title={name}
                  src={`${makeTemplate(icon_prop, resource)}`}
                  description={makeTemplate(description_prop, resource)}
                />
              </Link>
            </Grid>
          )
        })}
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(ResourceList)
