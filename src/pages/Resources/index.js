import React from 'react'
import IconButton from '../../components/IconButton';
import { fetch_meta_post } from '../../util/fetch/meta';

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

export const renamed = {
  'Human Phenotype Ontology': 'HPO',
  'MGI Mammalian Phenotype': 'MGIMP',
  'Cancer Cell Line Encyclopedia': 'CCLE',
  'NCI': 'NCI Pathways',
  'Disease Signatures': 'CREEDS',
  'Single Drug Perturbations': 'CREEDS',
  'Single Gene Perturbations': 'CREEDS',
  'clueio': 'Connectivity Map',
  'TRANSFAC AND JASPAR': 'TRANSFAC & JASPAR',
  'ENCODE/ChEA': 'ENCODE',
}

export const iconOf = {
  'CREEDS': 'http://amp.pharm.mssm.edu/CREEDS/img/creeds.png',
  'Connectivity Map': 'https://assets.clue.io/clue/public/img/favicon.ico',
}

export default class Test extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: [],
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
        <div className="row">
          <div className="col offset-s2 s8">
            {this.state.resources.map((resource) => (
              <IconButton
                key={resource.name}
                alt={resource.name}
                img={resource.icon}
              />
            ))}
          </div>
        </div>
      </main>
    )
  }
}