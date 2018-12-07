import React from 'react';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta';

const buildTitle = (library) => {
  const buildLabels = (labels) => (
    <span>
      {Object.keys(labels).map((key) => labels[key] === undefined || ((labels[key]+'') === '-666') ? null : (
        <div className="chip">{key}: {labels[key]}</div>
      ))}
    </span>
  )

  return (
    <div>
      {buildLabels({
        'Assay': library.meta.Assay,
        'Database': library.meta.Database,
        'Organism': library.meta.Organism,
        'Measurement': library.meta.Measurement,
        'Primary Resource': library.meta['Primary Resource'],
        'Name': library.meta.name || library.meta.file,
      })}
    </div>
  )
}

const buildImage = (collection) => {
  if(collection === 'Enrichr') {
    return (
      <img
        style={{
          alignSelf: 'center',
          maxWidth: '150px',
          maxHeight: '150px',
        }}
        alt={collection}
        src="http://amp.pharm.mssm.edu/enrichmentapi/images/enrichr.png"
      />
    )
  } else if(collection === 'CREEDS') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img
          style={{
            maxWidth: '100px',
            maxHeight: '150px',
          }}
          alt={collection}
          src="http://amp.pharm.mssm.edu/enrichmentapi/images/creeds.png"
        />
        CREEDS
      </div>
    )
  } else if(collection === 'ClueIO') {
    return (
      <img
        style={{
          maxWidth: '150px',
          maxHeight: '150px',
        }}
        alt={collection}
        src="http://amp.pharm.mssm.edu/enrichmentapi/images/clue.png"
      />
    )
  }
}

// TODO: delete
//  68181676-aacf-4ab2-9437-49ed358051e6
// TODO: merge
//  1c38c500-3968-474e-b32e-46dc2046087d
//  494bba05-98a9-4fba-86cd-5845fe71a6ba

// 654247 all
// 419401 enrichr
// 46657 clueio
// 364986 clueio

// 7758 creeds
const collection_library_counts = {
  'Enrichr': 128,
  'CREEDS': 3,
  'ClueIO': 1,
}
const collection_signature_counts = {
  'Enrichr': 234846,
  'CREEDS': 7758,
  'ClueIO': 411643,
}

export default class Collections extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      collections: {
        'Enrichr': '/@dcic/signature-commons-schema/meta/library/draft-1.json',
        'CREEDS': '/@dcic/signature-commons-schema/core/unknown.json',
        'ClueIO': '/@dcic/signature-commons-schema/core/unknown.json',
      },
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
        fields: ['meta.$validator'],
      }
    })
    this.setState({
      library_counts: collection_count['$validator'],
    })

    for(const validator of Object.keys(collection_count['$validator'])) {
      const libraries = await fetch_meta_post('/libraries/find', {
        filter: {
          where: {
            'meta.$validator': validator,
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
              validator,
              (signature_collection_counts.get(validator) || 0) + signature_count
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

  async get_libraries(collection) {
    const libraries = await fetch_meta_post('/libraries/find', {
      filter: {
        where: {
          // TODO: change this to a collection attribute
          'meta.$validator': collection
        }
      }
    })
    this.setState({libraries})
  }

  render() {
    return (
      <main id={this.props.id}>
        <div className="row">
          {Object.keys(this.state.collections).map((collection) => (
            <a
              key={collection}
              href="#!"
              onClick={() => this.get_libraries(this.state.collections[collection])}
              style={{
                color: 'black',
              }}
            >
              <div className="card col s4">
                <div className="card-image" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150}}>
                    {buildImage(collection)}
                </div>
                <div className="card-content">
                  <div className="chip">
                    Libraries: {collection_library_counts[collection]}
                  </div>
                    <div className="chip">
                    Signatures: {collection_signature_counts[collection]}
                  </div>
                </div>
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
                        {buildTitle(library)}
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
