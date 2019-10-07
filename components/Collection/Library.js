import React from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { fetch_meta } from '../../util/fetch/meta'
import ShowMeta from '../../components/ShowMeta'

import DataProvider from '../../util/fetch/model'

// Remove this
import schemas from '../../examples/dashboard/collection_sigcom.json'

const provider = new DataProvider()


export default class Library extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: undefined,
      collection_fields: {},
      controller: undefined,
    }
  }

  componentDidMount = async () => {
    const id = this.props.match.params.id
    const all_fields = schemas.reduce((acc, item) => {
      acc[item.Field_Name] = item
      return acc
    }, {})
    this.setState({
      all_fields,
      id,
    }, async () => {
      this.serialize_library(id)
      await this.getCollectionField(all_fields, id)
      this.getValueCounts(id)
    })
  }

  serialize_library = async (id) => {
    const data = await provider.serialize_library(id, {
      resource: true,
      library: true,
      signatures: true,
    })

    this.setState({
      data,
    })
  }

  getCollectionField = async (all_fields, id) => {
    if (this.state.controller !== undefined) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Fetching...',
        controller,
      })
      const { response: results } = await fetch_meta({
        endpoint: `/libraries/${id}/signatures/key_count`,
        signal: controller.signal,
      })
      const collection_fields = Object.keys(results).filter((field) => Object.keys(all_fields).indexOf(field) > -1)
      this.setState({
        collection_fields,
        status: '',
      })
    } catch (e) {
      if (e.code !== DOMException.ABORT_ERR) {
        // TO DO display status upon fail
        this.setState((prevState) => ({
          status: e + '',
        }))
      }
    }
  }

  getValueCounts = async (id) => {
    if (this.state.controller !== undefined) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Fetching...',
        controller,
      })
      const meta_promise = this.state.collection_fields.map(async (field) => {
        const { response: meta_stats } = await fetch_meta({
          endpoint: `/libraries/${id}/signatures/value_count`,
          body: {
            filter: {
              fields: [field],
            },
          },
          signal: controller.signal,
        })
        return meta_stats
      })
      const meta = await Promise.all(meta_promise)
      const meta_stats = meta.reduce((mapping, item) => {
        mapping = { ...item, ...mapping }
        return mapping
      }, {})

      const pie_stats = this.state.collection_fields.map((field) => {
        const item = this.state.all_fields[field]
        console.log(item)
        return {
          key: item.Preferred_Name || item.Field_Name,
          Preferred_Name: item.Preferred_Name_Singular || item.Preferred_Name || item.Field_Name,
          table: item.Table,
          stats: meta_stats[item.Field_Name],
          slice: item.Slice || 14,
        }
      })
      const pie_fields_and_stats = pie_stats.reduce((piestats, stats) => {
        piestats[stats.key] = { stats: stats.stats, table: this.props.ui_values.preferred_name[stats.table], Preferred_Name: stats.Preferred_Name, slice: stats.slice }
        return piestats
      }, {})
      this.setState({
        pie_fields_and_stats,
      })
    } catch (e) {
      if (e.code !== DOMException.ABORT_ERR) {
        // TO DO display status upon fail
        this.setState((prevState) => ({
          status: e + '',
        }))
      }
    }
  }

  render = () => {
    return (
      <div>
        {this.state.data === undefined ? null :
          <Grid container
            spacing={24}
            alignItems={'center'}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <ShowMeta
                    value={{
                      '@id': this.state.data.id,
                      '@type': this.props.ui_values.preferred_name_singular['libraries'],
                      'meta': this.state.data.meta,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        }
      </div>
    )
  }
}
