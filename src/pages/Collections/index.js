import React from 'react';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta';
import { Label } from '../../components/Label';

export default class Collections extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      collections: [
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "ConnectivityMap"
        },
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "CREEDS"
        },
        {
          "$validator": "/@dcic/signature-commons-schema/core/dataset.json",
          "dataset": "Enrichr"
        },
      ],
      libraries: [],
    }

    this.get_counts = this.get_counts.bind(this)
    this.get_libraries = this.get_libraries.bind(this)
  }

  componentDidMount() {
    // this.get_counts()
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
          console.log(signature_collection_counts)
          
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
          'dataset': dataset
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
            <a
              key={collection.dataset}
              href="#!"
              onClick={() => this.get_libraries(collection.dataset)}
              style={{
                color: 'black',
              }}
            >
              <div className="card col s4">
                <Label
                  item={collection}
                  visibility={1}
                />
              </div>
            </a>
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
