import React from 'react'
import IconButton from '../../components/IconButton';
import { fetch_meta_post } from '../../util/fetch/meta';

const primary_resources = [
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

const renamed = {
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

const iconOf = {
  'CREEDS': 'static/images/creeds.png',
  'Connectivity Map': 'static/images/clueio.ico',
}

export default class Test extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      resources: [],
      show_all: false,
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
      <div className="row" style={{backgroundColor: 'white'}}>
        {this.state.resources.filter(
          (resource) => primary_resources.indexOf(resource.name) !== -1
        ).map((resource) => (
          <IconButton
            key={resource.name}
            alt={resource.name}
            img={resource.icon}
          />
        ))}
        {!this.state.show_all ? null : this.state.resources.filter(
          (resource) => primary_resources.indexOf(resource.name) === -1
        ).map((resource) => (
          <IconButton
            key={resource.name}
            alt={resource.name}
            img={resource.icon}
          />
        ))}
        <IconButton
          alt={this.state.show_all ? "Less": "More"}
          icon={'more_horiz'}
          onClick={() => this.setState(({show_all}) => ({ show_all: !show_all }))}
        />
      </div>
    )
  }
}