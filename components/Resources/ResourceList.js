import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'
import { get_schema_props } from '../Resources'

const mapStateToProps = (state, ownProps) => {
  return {
    ui_values: state.ui_values,
  }
}

class ResourceList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sorted_resources: null,
      schema: null,
    }
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const sorted_resources = Object.values(this.props.resources).sort((r1, r2) => {
      // const {schema, name_prop, icon_prop, description_prop} = get_schema_props(r1, schemas)
      const { name_prop: r1_name_prop } = get_schema_props(r1, this.props.schemas)
      let r1_name = makeTemplate(r1_name_prop, r1)
      if (r1_name === 'undefined') r1_name = r1.id
      const { name_prop: r2_name_prop } = get_schema_props(r2, this.props.schemas)
      let r2_name = makeTemplate(r2_name_prop, r2)
      if (r2_name === 'undefined') r2_name = r2.id
      return (r1_name.localeCompare(r2_name))
    })
    this.setState({
      sorted_resources,
    })
  }

  async componentDidUpdate(prevProps) {
    if (Object.keys(this.props.resources).length !== Object.keys(prevProps.resources).length) {
      const sorted_resources = Object.values(this.props.resources).sort((r1, r2) => {
        // const {schema, name_prop, icon_prop, description_prop} = get_schema_props(r1, schemas)
        const { name_prop: r1_name_prop } = get_schema_props(r1, this.props.schemas)
        let r1_name = makeTemplate(r1_name_prop, r1)
        if (r1_name === 'undefined') r1_name = r1.id
        const { name_prop: r2_name_prop } = get_schema_props(r2, this.props.schemas)
        let r2_name = makeTemplate(r2_name_prop, r2)
        if (r2_name === 'undefined') r2_name = r2.id
        return (r1_name.localeCompare(r2_name))
      })
      this.setState((prevState) => ({
        sorted_resources: [...prevState.sorted_resources, ...sorted_resources],
      }))
    }
  }

  render() {
    const sorted_resources = this.state.sorted_resources
    if (sorted_resources === null) {
      return null
    }
    const md = sorted_resources.length > 6 ? 2 : 4
    const sm = sorted_resources.length > 6 ? 4 : 6
    const xs = 6
    return (
      <Grid
        container
        direction="row"
        alignItems="flex-start"
      >
        {sorted_resources.map((resource) => {
          const { name_prop, icon_prop, description_prop } = get_schema_props(resource, this.props.schemas)
          let name = makeTemplate(name_prop, resource)
          if (name === 'undefined') name = resource.id
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
        {this.props.total_count > sorted_resources.length ?
          <Grid item xs={xs} sm={sm} md={md}
            style={{ textAlign: 'center' }}
            key={'more'}
          >
            <IconButton
              alt={'more'}
              title={'See More'}
              icon="mdi-dots-horizontal"
              description={'See More'}
              onClick={(props) => this.props.onClickMore()}
            />
          </Grid>
          : null}
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(ResourceList)
