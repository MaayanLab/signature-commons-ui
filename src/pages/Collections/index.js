import React from 'react';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta';
import { Label } from '../../components/Label';
import { call } from '../../util/call';

export default class Collections extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      collection_library_counts: {
        'enrichr': 128,
        'creeds': 3,
        'lincs': 1,
      },
      collection_signature_counts: {
        'enrichr': 234846,
        'creeds': 7758,
        'lincs': 411643,
      },
      collections: [
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "lincs"
        },
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "creeds"
        },
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "enrichr"
        },
      ],
      libraries: [],
    }

    this.get_counts = this.get_counts.bind(this)
    this.get_libraries = this.get_libraries.bind(this)
  }

  async componentDidMount() {
    // this.get_counts()
    const libraries = await fetch_meta_post('/libraries/find', {})
    this.setState({libraries})
  }

  async get_counts() {
    const collection_count = await fetch_meta('/libraries/value_count', {
      filters: {
        fields: ['dataset'],
      }
    })
    this.setState({
      library_counts: collection_count['dataset'],
    })

    for(const dataset of Object.keys(collection_count['dataset'])) {
      const libraries = await fetch_meta_post('/libraries/find', {
        filter: {
          where: {
            dataset
          }
        }
      })
      for(const library of libraries) {
        const signature_count = (await fetch_meta('/signatures/count', {
          where: {
            library: library.id,
          }
        })).count

        this.setState(({signature_collection_counts, signature_library_counts}) => {
          return {
            signature_collection_counts: signature_collection_counts.set(
              dataset,
              (signature_collection_counts.get(dataset) || 0) + signature_count
            ),
            signature_library_counts: signature_library_counts.set(
              library.id,
              signature_count
            ),
          }
        })
      }
    }
  }

  async get_libraries(dataset) {
    const libraries = await fetch_meta_post('/libraries/find', {
      filter: {
        where: {
          dataset: dataset
        }
      }
    })
    this.setState({libraries})
  }

  render() {
    return (
      <main id={this.props.id}>
        <div className="row">
          {this.state.collections.map((collection) => (
            <div
              key={collection.dataset}
              className="card col s4 center"
            >
              <div className="card-content">
                <a
                  href="#!"
                  onClick={call(this.get_libraries, collection.dataset)}
                  style={{
                    color: 'black',
                  }}
                >
                  <Label
                    item={collection}
                    visibility={1}
                  />
                </a>
              </div>
            </div>
          ))}
          <div className="col s12">
            {this.state.libraries === undefined ? null : (
              <ul
                className="collapsible popout"
              >
                {this.state.libraries.map((library) => (
                  <li
                    key={library.id}
                  >
                    <div
                      className="collapsible-header"
                      style={{
                        display: 'flex',
                        flexDirection: "row",
                      }}>
                        <Label
                          item={library}
                          visibility={1}
                        />
                    </div>
                    <div
                      className="collapsible-body"
                    >
                      <div 
                        style={{
                          height: '300px',
                          overflow: 'auto',
                        }}
                      >
                        <ShowMeta
                          value={{ID: library.id, ...library.meta}}
                        />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
            )}
          </div>
        </div>
      </main>
    )
  }
}
