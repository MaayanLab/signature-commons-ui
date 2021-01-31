import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import MetadataPage from './MetadataPage'
import EnrichmentPage from './EnrichmentPage'
export default class Pages extends React.PureComponent {
	
	metadata_page = (props) => {
		return <MetadataPage {...this.props} {...props}/>
	}

	enrichment_page = (props) => {
		return <EnrichmentPage {...this.props} {...props}/>
	}
	
	render = () => (
		<Switch>
			<Route
              path={`${this.props.nav.SignatureSearch.endpoint}/:type/:enrichment_id/:model_name/:id`}
			  component={this.enrichment_page}
			  exact
            />
			<Route
              path="/:model/:id"
              component={this.metadata_page}
            />
		</Switch>
	)
}