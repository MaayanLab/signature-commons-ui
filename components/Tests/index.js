import React from 'react'
import ReactJson from 'react-json-view'
import { fetch_meta } from '../../util/fetch/meta'
import Plot from 'react-plotly.js'
import { Map } from 'immutable'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'

export default class Tests extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      key_value_counts: Map(),
      libraries: {},
      duration: 0,
      duration_meta: 0,
      fields: ['Assay', 'Organism', 'Tissue.Name'],
    }
  }
  async componentDidMount() {
    let duration_meta = 0
    const start = new Date()
    const { duration: duration_meta_1, response: libraries } = await fetch_meta({ endpoint: '/libraries' })
    duration_meta += duration_meta_1

    this.setState({
      libraries: maybe_fix_obj(libraries),
    })

    for (const library of libraries) {
      const { duration: duration_meta_2, response: value_counts } = await fetch_meta({
        endpoint: '/signatures/value_count',
        body: {
          filter: {
            where: {
              library: library.id,
            },
            fields: this.state.fields,
          },
          depth: 5,
          contentRange: false,
        },
      })
      duration_meta += duration_meta_2

      this.setState(({ key_value_counts }) => ({
        key_value_counts: key_value_counts.set(library.id, value_counts),
      }))
    }

    this.setState({
      duration_meta,
      duration: (new Date() - start) / 1000,
    })
  }
  render() {
    return (
      <div className="row" style={{ backgroundColor: 'white' }}>
        Took {this.state.duration} seconds on ui, {this.state.duration_meta} on backend.
        {this.state.fields.map((field) => (
          <div
            key={field}
            className="col s12"
          >
            <Plot
              layout={{
                title: field,
                barmode: 'stack',
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '800px' }}
              data={Object.values(this.state.libraries).map((library) => {
                const key_value_counts = this.state.key_value_counts.get(library.id)
                if (key_value_counts === undefined) return {}

                const value_counts = key_value_counts[field]
                if (value_counts === undefined) return {}

                const data = {
                  name: library.meta['Library_name'],
                  orientation: 'h',
                  type: 'bar',
                  y: Object.keys(value_counts),
                  x: Object.values(value_counts),
                }

                return data
              })}
            />
          </div>
        ))}
        <div className="col s12">
          <ReactJson
            src={this.state.response}
            collapsed={2}
          />
        </div>
      </div>
    )
  }
}
