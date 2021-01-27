import React from 'react'
import isUUID from 'validator/lib/isUUID'
import IconButton from '../../components/IconButton'
import ShowMeta from '../../components/ShowMeta'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'

import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import TablePagination from '@material-ui/core/TablePagination'
import { URLFormatter } from '../../util/helper/misc'

import DataTable from '../MetadataSearch/DataTable'
import { ExpandedMeta } from '../MetadataSearch/ExpandedMeta'
import { fetch_meta_post, fetch_meta } from '../../util/fetch/meta'

import { makeTemplate } from '../../util/ui/makeTemplate'
import { connect } from 'react-redux'
import { get_card_data } from '../MetadataSearch/MetadataSearchResults'
import { download_resource_json,
  download_library_json } from '../MetadataSearch/download'

import { get_schema_props } from '../Resources'
const download = {
  libraries: download_library_json,
  resources: download_resource_json,
}

const mapStateToProps = (state, ownProps) => {
  return {
    ui_values: state.ui_values,
    preferred_name_singular: state.ui_values.preferred_name_singular,
  }
}

class ResourcePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 0,
      resource: null,
      perPage: 10,
      collection: [],
      sorted: null,
    }
  }
  redirectLink(url) {
    return (e) => window.open(url, '_blank').focus()
  }

  async componentDidMount() {
    const res = this.props.match.params.resource.replace(/_/g, ' ')
    const resource = await this.get_resource(res)
    if (resource !== null) {
      const { collection, count } = await this.get_children(this.state.page, this.state.perPage, resource)
      this.setState({
        resource,
        collection,
        count,
      })
    }
  }

  async componentDidUpdate(prevProps) {
    const res = this.props.match.params.resource.replace(/_/g, ' ')
    const prevRes = prevProps.match.params.resource.replace(/_/g, ' ')
    if (res != prevRes) {
      const resource = await this.get_resource(res)
      if (resource !== null) {
        const { collection, count } = await this.get_children(this.state.page, this.state.perPage, resource)
        this.setState({
          resource,
          collection,
          count,
        })
      }
    }
  }

  get_resource = async (res) => {
    let resource = null
    if (this.props.resources[res] !== undefined) {
      resource = this.props.resources[res]
      resource.libraries = undefined
    } else if (this.props.resources[res] === undefined && isUUID(res + '')) {
      const { response } = await fetch_meta_post({
        endpoint: `/resources/find`,
        body: {
          filter: {
            where: {
              id: res,
            },
          },
        },
      })
      // it's in resources
      if (response.length > 0) {
        resource = response[0]
      } else {
        // find in libraries
        const { response } = await fetch_meta_post({
          endpoint: `/libraries/find`,
          body: {
            filter: {
              where: {
                id: res,
              },
            },
          },
        })
        if (response.length > 0) {
          resource = response[0]
        }
      }
    }
    return resource
  }

  get_children = async (page, perPage, resource) => {
    const endpoint = resource.dataset_type === undefined ? '/libraries/find' : '/signatures/find'
    const parent = resource.dataset_type === undefined ? 'resource' : 'library'
    const { response, contentRange } = await fetch_meta_post({
      endpoint,
      body: {
        filter: {
          where: {
            [parent]: resource.id,
          },
          limit: this.state.perPage,
          skip: this.state.page * this.state.perPage,
        },
      },
    })
    const collection = response.map((data) => {
      if (data.library !== undefined) data.library = resource
      return get_card_data(data, this.props.schemas)
    })
    return {
      collection,
      ...contentRange,
    }
  }

  async handleDownload(type, id) {
    await download[type](id)
  }

  handleExpand = (e) => {
    const id = e.target.value
    if (this.state.expanded_id === id) {
      // If you click the same card then collapse it
      this.setState({
        expanded_id: null,
      })
    } else {
      this.setState({
        expanded_id: id,
      })
    }
  }

  handleChangeRowsPerPage = async (e, name) => {
    const perPage = e.target.value
    const { collection } = await this.get_children(this.state.page, perPage, this.state.resource)
    this.setState({
      perPage,
      collection,
    })
  }

  handleChangePage = async (event, page, name) => {
    const { collection } = await this.get_children(page, this.state.perPage, this.state.resource)
    this.setState({
      page,
      collection,
    })
  }

  onChipClick = (value) => {
    const query = URLFormatter({ search: [value],
      current_table: 'Datasets',
      reverse_preferred_name: this.props.reverse_preferred_name })
    this.props.history.push({
      pathname: `/MetadataSearch/Datasets`,
      search: `?query=${query}`,
      state: {
        new_search: true,
        pagination: false,
        new_filter: false,
      },
    })
  }

  render() {
    if (this.state.resource === null) {
      return <CircularProgress color="primary"/>
    }

    const resource = this.state.resource
    const { name_prop, icon_prop } = get_schema_props(resource, this.props.schemas)
    let resource_name = makeTemplate(name_prop, resource)
    resource_name = resource_name === 'undefined' ? resource.id : resource_name
    return (
      <Grid
        container
      >
        <Grid item xs={12}>
          <Card>
            <Grid
              container
              direction="row"
            >
              <Grid item md={2} xs={4} style={{ textAlign: 'center' }}>
                <CardMedia style={{ marginTop: -15, paddingLeft: 13 }}>
                  <Link
                    to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
                    className="waves-effect waves-teal"
                  >
                    <IconButton
                      src={`${makeTemplate(icon_prop, resource)}`}
                      description={'Go back to resource list'}
                    />
                  </Link>
                </CardMedia>
              </Grid>
              <Grid item md={10} xs={8}>
                <CardContent>
                  <Grid
                    container
                    direction="row"
                  >
                    <Grid item xs={12}>
                      <ShowMeta
                        hidden={[resource_name]}
                        value={{
                          '@id': resource.id,
                          '@name': resource_name, // this.props.ui_values.preferred_name_singular['resources'] || 'Resource',
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
                        to={'#'}
                        onClick={() => this.props.history.goBack()}
                        className="waves-effect waves-teal btn-flat"
                      >
                        <span style={{ color: 'orange' }}>BACK</span>
                      </Link>
                    </Grid>
                  </Grid>
                </CardActions>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12}>
          { this.state.collection.length > 0 ?
            <div style={{ margin: '20px 0' }}>
              <DataTable schemas={this.props.schemas}
                ui_values={this.props.ui_values}
                {...this.state}
                loaded={true}
                onChipClick={this.onChipClick}
                current_table={'resources'}
                type={this.props.preferred_name_singular['resources']}
                history={this.props.history}
                deactivate_download={true}
                expandRenderer={(props) => ExpandedMeta(props)}
              />
              <TablePagination
                page={this.state.page}
                rowsPerPage={this.state.perPage}
                count={ this.state.count}
                onChangePage={(event, page) => this.handleChangePage(event, page)}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                component="div"
              />
            </div> :
            null
          }
        </Grid>
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(ResourcePage)
