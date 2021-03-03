import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import MetadataPage from './MetadataPage'
import EnrichmentPage from './EnrichmentPage'
export default class Pages extends React.PureComponent {
	
	metadata_page = (props) => {
		const {
			metadata_resolver,
			enrichment_resolver,
			...rest
		} = this.props
		return <MetadataPage {...this.props} {...props} resolver={metadata_resolver}/>
	}

	enrichment_page = (props) => {
		const {
			metadata_resolver,
			enrichment_resolver,
			...rest
		} = this.props
		return <EnrichmentPage {...rest} {...props} resolver={enrichment_resolver}/>
	}
	
	render = () => (
		<Switch>
			<Route
              path={`/Enrichment/:type/:enrichment_id/:model_name/:id`}
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