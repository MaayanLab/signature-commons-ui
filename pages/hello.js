import React from 'react'
import { fetch_meta } from '../util/fetch/meta'

export default class extends React.Component {
	static async getInitialProps() {
		const { response, base_url } = await fetch_meta({ endpoint: '/libraries/count', body: {} })

		return {
			'hi': response,
		}
	}

	render() {
		return (
			<div>{JSON.stringify(this.props.hi.count)}</div>
		)
	}
}
