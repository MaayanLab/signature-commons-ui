import React from 'react'
import IconButton from '../../components/IconButton';
import { ShowMeta } from '../../components/ShowMeta';
import { fetch_meta_post } from '../../util/fetch/meta';
import { Label } from '../../components/Label';
import M from "materialize-css";

export const primary_resources = [
  'CREEDS',
  'ARCHS4',
  'KEGG',
  'GTEx',
  'ENCODE',
  'HPO',
  'CCLE',
  'Allen Brain Atlas',
  'Achilles',
]

export const primary_two_tailed_resources = [
  'CMAP'
]

export const renamed = {
  'Human Phenotype Ontology': 'HPO',
  'MGI Mammalian Phenotype': 'MGI-MP',
  'Cancer Cell Line Encyclopedia': 'CCLE',
  'NCI': 'NCI Pathways',
  'Disease Signatures': 'CREEDS',
  'Single Drug Perturbations': 'CREEDS',
  'Single Gene Perturbations': 'CREEDS',
  'clueio': 'CMAP',
  'TRANSFAC AND JASPAR': 'TRANSFAC & JASPAR',
  'ENCODE/ChEA': 'ENCODE',
  'Gene Ontology Consortium': 'Gene Ontology',
}

export const iconOf = {
  'CREEDS': 'http://amp.pharm.mssm.edu/CREEDS/img/creeds.png',
  'CMAP': 'https://assets.clue.io/clue/public/img/favicon.ico',
}

export default class Test extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: [],
      selected: null,
    }
  }
  async componentDidMount() {
    const libraries = await fetch_meta_post('/libraries/find', {})
    const resources = libraries.reduce((groups, lib) => {
      let resource = renamed[lib.meta['Primary Resource'] || lib.meta['name']] || lib.meta['Primary Resource'] || lib.meta['name']
      if ((lib.meta['Library name'] || '').indexOf('ARCHS4') !== -1)
        resource = 'ARCHS4'

      if (groups[resource] === undefined) {
        groups[resource] = {
          name: resource,
          icon: iconOf[resource] || lib.meta['Icon'],
          libraries: []
        }
      }
      groups[resource].libraries.push(lib)
      return groups
    }, {})
    this.setState({
      resources: Object.values(resources),
    })
  }

  render() {
    return (
      <main id={this.props.id}>
        {this.state.selected ? (
          <div className="row">
            <div className="col s12">
              <div className="col s2">
                <IconButton
                  key={this.state.selected.name}
                  alt={this.state.selected.name}
                  img={this.state.selected.icon}
                  onClick={() => this.setState({ selected: null })}
                />
              </div>
              <div className="col s10">
                <ul
                  className="collapsible popout"
                >
                  {this.state.selected.libraries.map((library) => (
                    <li
                      key={library.id}
                    >
                      <div
                        className="collapsible-header"
                        style={{
                          padding: 10,
                          display: 'flex',
                          flexDirection: 'row',
                          backgroundColor: 'rgba(255,255,255,1)',
                        }}
                      >
                        <Label
                          item={library}
                          visibility={1}
                        />
                        <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                        <a
                          href="#!"
                          style={{ border: 0 }}
                        >
                          <i className="material-icons">expand_more</i>
                        </a>
                      </div>
                      <div
                        className="collapsible-body"
                      >
                        <ShowMeta
                          value={library}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col offset-s2 s8">
              {this.state.resources.map((resource) => (
                <IconButton
                  key={resource.name}
                  alt={resource.name}
                  img={resource.icon}
                  onClick={() => this.setState({ selected: resource }, () => M.AutoInit())}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    )
  }
}