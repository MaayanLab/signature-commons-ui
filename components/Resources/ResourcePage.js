import React from 'react'
import isUUID from 'validator/lib/isUUID';
import IconButton from '../../components/IconButton'
import { call } from '../../util/call'
import ShowMeta from '../../components/ShowMeta'
import { Label } from '../../components/Label'
import { Link } from 'react-router-dom'
import NProgress from 'nprogress'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';

import { fetch_meta_post, fetch_meta } from '../../util/fetch/meta'

import { makeTemplate } from '../../util/makeTemplate'
import { connect } from 'react-redux';
import { findMatchedSchema } from '../../util/objectMatch'

import { download_resource_json,
  download_library_json } from '../MetadataSearch/download'

const download = {
  libraries: download_library_json,
  resources: download_resource_json,
}

const mapStateToProps = (state, ownProps) => {
  const {ui_values, resources, schemas} = state.serverSideProps
  return { 
    ui_values,
    resources,
    schemas
  }
};

class ResourcePage extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      resource: null,
      schema: null,
      expanded_id: null,
    }
  }
  redirectLink(url) {
    return (e) => window.open(url, '_blank').focus()
  }

  async componentDidMount(){
    let res = this.props.match.params.resource.replace(/_/g, ' ')
    let resource
    console.log(res)
    if (isUUID(res+'')){
      // uuid fetch resource
      const {response} = await fetch_meta({
        endpoint: `/resources/${res}`
      })
      resource = response
      const {response: libraries} = await fetch_meta_post({
        endpoint: `/libraries/find`,
        body: {
          filter: {
            where: {
              resource: res,
            }
          }
        },
      })
      resource.libraries = libraries
    } else {
      resource = this.props.resources[res]
    }
    const schema = await findMatchedSchema(resource, this.props.schemas)
    const name_props = Object.values(schema.properties).filter(prop=>prop.name)
    const name_prop = name_props.length > 0 ? name_props[0].text : "${id}"
    const icon_props = Object.values(schema.properties).filter(prop=>prop.icon)
    const icon_prop = icon_props.length > 0 ? icon_props[0].src : "${id}"
    const description_props = Object.values(schema.properties).filter(prop=>prop.description)
    const description_prop = description_props.length > 0 ? description_props[0].text : "${id}"

    this.setState({
      schema,
      resource,
      icon_prop,
      name_prop,
      description_prop,
    })

  }

  async componentDidUpdate(prevProps){
    let res = this.props.match.params.resource.replace(/_/g, ' ')
    let prevRes = prevProps.match.params.resource.replace(/_/g, ' ')
    if (res!=prevRes){
      let resource
      console.log(res)
      if (isUUID(res+'')){
        // uuid fetch resource
        const {response} = await fetch_meta({
          endpoint: `/resources/${res}`
        })
        resource = response
        const {response: libraries} = await fetch_meta_post({
          endpoint: `/libraries/find`,
          body: {
            filter: {
              where: {
                resource: res,
              }
            }
          },
        })
        resource.libraries = libraries
      } else {
        resource = this.props.resources[res]
      }
      const schema = await findMatchedSchema(resource, this.props.schemas)
      const name_props = Object.values(schema.properties).filter(prop=>prop.name)
      const name_prop = name_props.length > 0 ? name_props[0].text : "${id}"
      const icon_props = Object.values(schema.properties).filter(prop=>prop.icon)
      const icon_prop = icon_props.length > 0 ? icon_props[0].src : "${id}"
      const description_props = Object.values(schema.properties).filter(prop=>prop.description)
      const description_prop = description_props.length > 0 ? description_props[0].text : "${id}"

      this.setState({
        schema,
        resource,
        icon_prop,
        name_prop,
        description_prop,
      })
    }
  }

  async handleDownload(type, id) {
    NProgress.start()
    await download[type](id)
    NProgress.done()
  }

  handleExpand = (e) =>{
    const id = e.target.value
    if (this.state.expanded_id===id){
      // If you click the same card then collapse it
      this.setState({
        expanded_id: null
      })
    }else{
      this.setState({
        expanded_id: id
      })
    }
  }

  render() {
    if (this.state.resource===null){
      return <div />
    }
    const {resource,
      icon_prop,
      name_prop,
      description_prop,} = this.state
    return (
      <Grid
        container
        direction="row"
      >
        <Grid item xs={12}>
          <Card>
            <Grid
                container
                direction="row"
              >
                <Grid item xs={1}>
                  <CardMedia style={{marginTop:-10}}>
                    <Link
                      to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
                      className="waves-effect waves-teal"
                    >
                      <IconButton
                        src={`${makeTemplate(icon_prop, resource)}`}
                        description={"Go back to resource list"}
                      />
                    </Link>
                  </CardMedia>
                </Grid>
                <Grid item xs={11}>
                  <CardContent>
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xs={12}>
                        <Typography variant="display1" gutterBottom>
                          {makeTemplate(name_prop, resource)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <ShowMeta
                          value={{
                            '@id': resource.id,
                            '@type': this.props.ui_values.preferred_name_singular['resources'] || 'Resource',
                            'meta': Object.keys(resource.meta).filter((key) => (
                              ['name', 'icon'].indexOf(key) === -1)).reduce((acc, key) => {
                              acc[key] = resource.meta[key]
                              return acc
                            }, {}),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <CardActions>
                    <Grid container justify="space-between">
                      <Grid item xs={1}>
                      </Grid>
                      <Grid item xs={1}>
                        <Link
                          to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
                          className="waves-effect waves-teal btn-flat"
                        >
                          <span style={{color:"orange"}}>BACK</span>
                        </Link>
                      </Grid>
                    </Grid>
                  </CardActions>
                </Grid>
              </Grid>
          </Card>
        </Grid>
        <Grid item xs={12}>
          { !resource.is_library ?
            <div style={{margin: '20px 0'}}>
            {resource.libraries.map((library) => (
              <Card key={library.id}>
                <CardContent>
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                  >
                    <Grid item xs={11}>
                      <Label
                        item={library}
                        visibility={1}
                        schemas={this.props.schemas}
                      />
                    </Grid>
                    <Grid item xs={1} style={{textAlign: "right"}}>
                      <Button className={`mdi
                        ${this.state.expanded_id===library.id ? 'mdi-chevron-up': 'mdi-chevron-down'}
                        mdi-24px`}
                        style={{padding: '0 20px'}}
                        onClick={this.handleExpand}
                        value={library.id}
                        />
                    </Grid>
                  </Grid>
                </CardContent>
                <Collapse in={this.state.expanded_id===library.id} timeout="auto" unmountOnExit>
                  <CardContent>
                    <ShowMeta
                      value={{
                        '@id': library.id,
                        '@type': 'Library',
                        'meta': library.meta,
                      }}
                    />
                  </CardContent>
                </Collapse>
              </Card>
            ))}
            </div> :
            null 
          }
        </Grid>
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(ResourcePage)

