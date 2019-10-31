import React from 'react'
import isUUID from 'validator/lib/isUUID'
import IconButton from '../../components/IconButton'
import ShowMeta from '../../components/ShowMeta'
import { Link } from 'react-router-dom'
import NProgress from 'nprogress'
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
import { fetch_meta_post, fetch_meta } from '../../util/fetch/meta'

import { makeTemplate } from '../../util/makeTemplate'
import { connect } from 'react-redux'
import { get_card_data } from '../MetadataSearch/MetadataSearchResults'
import { download_resource_json,
  download_library_json } from '../MetadataSearch/download'

const download = {
  libraries: download_library_json,
  resources: download_resource_json,
}

const mapStateToProps = (state, ownProps) => {
  const { ui_values } = state.serverSideProps
  return {
    ui_values,
    preferred_name_singular: ui_values.preferred_name_singular,
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
    let resource
    if (isUUID(res + '')) {
      // uuid fetch resource
      const { response } = await fetch_meta({
        endpoint: `/resources/${res}`,
      })
      resource = response
      const { response: libraries } = await fetch_meta_post({
        endpoint: `/libraries/find`,
        body: {
          filter: {
            where: {
              resource: res,
            },
          },
        },
      })
      resource.libraries = libraries
    } else {
      resource = this.props.resources[res]
      const { response: libraries } = await fetch_meta_post({
        endpoint: `/libraries/find`,
        body: {
          filter: {
            where: {
              resource: resource.id,
            },
          },
        },
      })
      resource.libraries = libraries
    }

    const start = this.state.page * this.state.perPage
    const end = (this.state.page + 1) * this.state.perPage
    let children = []
    if (resource !== null && !resource.is_library) {
      children = resource.libraries.slice(start, end)
    }
    const collection = children.map((data) => get_card_data(data, this.props.schemas))

    this.setState({
      resource,
      collection,
    })
  }

  async componentDidUpdate(prevProps) {
    const res = this.props.match.params.resource.replace(/_/g, ' ')
    const prevRes = prevProps.match.params.resource.replace(/_/g, ' ')
    if (res != prevRes) {
      let resource

      if (isUUID(res + '')) {
        // uuid fetch resource
        const { response } = await fetch_meta({
          endpoint: `/resources/${res}`,
        })
        resource = response
        const { response: libraries } = await fetch_meta_post({
          endpoint: `/libraries/find`,
          body: {
            filter: {
              where: {
                resource: res,
              },
            },
          },
        })
        resource.libraries = libraries
      } else {
        resource = this.props.resources[res]
        const { response: libraries } = await fetch_meta_post({
          endpoint: `/libraries/find`,
          body: {
            filter: {
              where: {
                resource: resource.id,
              },
            },
          },
        })
        resource.libraries = libraries
      }
      const start = this.state.page * this.state.perPage
      const end = (this.state.page + 1) * this.state.perPage
      let children = []
      if (resource !== null && !resource.is_library) {
        children = resource.libraries.slice(start, end)
      }
      const collection = children.map((data) => get_card_data(data, this.props.schemas))

      this.setState({
        resource,
        collection,
      })
    }
  }

  async handleDownload(type, id) {
    NProgress.start()
    await download[type](id)
    NProgress.done()
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

  handleChangeRowsPerPage = (e, name) => {
    const perPage = e.target.value
    const start = this.state.page * perPage
    const end = (this.state.page + 1) * perPage
    let children = []
    if (!this.state.resource.is_library) {
      children = this.state.resource.libraries.slice(start, end)
    }
    const collection = children.map((data) => get_card_data(data, this.props.schemas))
    this.setState({
      perPage,
      collection,
    })
  }

  handleChangePage = (event, page, name) => {
    const start = page * this.state.perPage
    const end = (page + 1) * this.state.perPage
    let children = []
    if (!this.state.resource.is_library) {
      children = this.state.resource.libraries.slice(start, end)
    }
    const collection = children.map((data) => get_card_data(data, this.props.schemas))
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
      search: `?q=${query}`,
      state: {
        new_search: true,
        pagination: false,
        new_filter: false,
      },
    })
  }

  render() {
    if (this.state.resource === null) {
      return <CircularProgress />
    }
    const { icon_prop,
      name_prop,
    } = this.props

    const resource = this.state.resource

    let resource_name = makeTemplate(name_prop, resource)
    resource_name = resource_name === 'undefined' ? resource.id : resource_name
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
                <CardMedia style={{ marginTop: -10 }}>
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
              <Grid item xs={11}>
                <CardContent>
                  <Grid
                    container
                    direction="row"
                  >
                    <Grid item xs={12}>
                      <ShowMeta
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
                        to={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
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
              />
              <TablePagination
                page={this.state.page}
                rowsPerPage={this.state.perPage}
                count={ this.state.resource.libraries.length}
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
