import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import NProgress from 'nprogress'
import ShowMeta from '../../components/ShowMeta'
import CircularProgress from '@material-ui/core/CircularProgress'

import { get_signature, get_library } from '../MetadataSearch/download'

const metadata_mapper = {
  libraries: get_library,
  signatures: get_signature,
}

const opts_mapper = {
  libraries: {
    resource: true,
    library: true,
    signatures: false,
    data: false,
    validator: true,
  },
  signatures: {
    resource: false,
    library: true,
    signatures: true,
    data: false,
    validator: true,
  },
}

const child_opts_mapper = {
  libraries: {
    resource: false,
    library: true,
    signatures: true,
    data: false,
    validator: true,
  },
  signatures: {
    resource: false,
    library: false,
    signatures: true,
    data: true,
    validator: true,
  },
}

const plural_mapper = {
  library: 'libraries',
  signature: 'signatures',
  entity: 'entities',
  resource: 'resources',
}
const mapStateToProps = (state) => {
  const preferred_name = state.ui_values.preferred_name
  return {
    preferred_name,
    reverse_preferred_name: state.reverse_preferred_name,
    parents: state.parents_mapping,
  }
}

class Pages extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      metadata: null,
      children: [],
    }
  }

  componentDidMount = async () => {
    let { table, id: item } = this.props.match.params
    table = this.props.reverse_preferred_name[table]
    if (this.props.location.state !== undefined && this.props.location.state.item !== undefined) {
      item = {
        ...this.props.location.state.item,
      }
    }
    let metadata
    let children
    try {
      NProgress.start()
      metadata = await metadata_mapper[table]({ item, opts: {
        resource: true,
        library: true,
        signatures: false,
        data: false,
        validator: true,
      } })
      children = await metadata_mapper[table]({ item, opts: {
        resource: false,
        library: true,
        signatures: true,
        data: false,
        validator: true,
      } })
      NProgress.done()
      this.setState({ metadata, children })
    } catch (error) {
      console.warn(error)
      this.setState({
        metadata: undefined,
      })
    }
  }

  render = () => {
    const current_table = this.props.reverse_preferred_name[this.props.match.params.table]

    if (current_table === undefined || this.state.metadata === undefined) {
      return <Redirect to="/not-found" />
    }
    if (this.state.metadata === null) {
      return <CircularProgress />
    }
    return (
      <div>
        <ShowMeta
          value={[
            {
              '@id': this.state.metadata.id,
              '@type': this.props.match.params.table,
              'meta': this.state.metadata.meta,
            },
            {
              '@id': this.state.metadata[this.props.parents[current_table]].id,
              '@type': this.props.preferred_name[plural_mapper[this.props.parents[current_table]]],
              'meta': this.state.metadata[this.props.parents[current_table]].meta,
            },
          ]}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps)(Pages)
