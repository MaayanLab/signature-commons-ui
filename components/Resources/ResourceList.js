import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import IconButton from '../../components/IconButton'
import { makeTemplate } from '../../util/makeTemplate'
import { objectMatch } from '../../util/makeTemplate'
import { connect } from 'react-redux';
import { findMatchedSchema } from '../../util/objectMatch'

const mapStateToProps = (state, ownProps) => {
  const {ui_values, resources, schemas} = state.serverSideProps
  return { 
    ui_values,
    resources: Object.values(resources),
    schemas
  }
};

class ResourceList extends React.PureComponent {
  
  constructor(props){
    super(props)
    this.state = {
      sorted_resources: [],
      schema: null
    }
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const schema = await findMatchedSchema(this.props.resources[0], this.props.schemas)
    const name_props = Object.values(schema.properties).filter(prop=>prop.name)
    const name_prop = name_props.length > 0 ? name_props[0].text : "${id}"
    const icon_props = Object.values(schema.properties).filter(prop=>prop.icon)
    const icon_prop = icon_props.length > 0 ? icon_props[0].src : "${id}"
    const description_props = Object.values(schema.properties).filter(prop=>prop.description)
    const description_prop = description_props.length > 0 ? description_props[0].text : "${id}"
    const sorted_resources = [...this.props.resources].sort((r1, r2) => {
      const r1_name = makeTemplate(name_prop, r1)
      const r2_name = makeTemplate(name_prop, r2)
      return (r1_name.localeCompare(r2_name))
    })
    this.setState({
      schema,
      sorted_resources,
      icon_prop,
      name_prop,
      description_prop,
    })
  }

  render() {
    const {sorted_resources,
      icon_prop,
      name_prop,
      description_prop,} = this.state

    if (sorted_resources.length === 0 ){
      return <div> hi</div>
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
          return (
            <Grid item xs={xs} sm={sm} md={md} 
                  style={{textAlign: 'center',}}
                  key={makeTemplate(name_prop, resource)}>
              <Link
                key={resource.id}
                to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}/${ makeTemplate(name_prop, resource).replace(/ /g, '_')}`}
              >
                <IconButton
                  alt={makeTemplate(name_prop, resource)}
                  title={makeTemplate(name_prop, resource)}
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
