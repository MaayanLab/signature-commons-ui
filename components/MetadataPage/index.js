import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import {DataTable, ShowMeta} from '../DataTable'
import DataResolver from '../../connector/data_resolver'
import CircularProgress from '@material-ui/core/CircularProgress'


export default class MetadataPage extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			resolver: new DataResolver(),
			entry: null
		}
	}

	componentDidMount = async () => {
		const {model, id} = this.props.match.params
		console.log(this.props.match.params)
		const {resolved_entries} = await this.state.resolver.resolve_entries({model, entries: [id]})
		console.log(resolved_entries)
		const entry = await resolved_entries[id].entry()
		const parent = await resolved_entries[id].parent()
		const children = await resolved_entries[id].children()
		this.setState({
			entry_object: resolved_entries[id],
			entry,
			parent,
			children
		})
	}

	render = () => {
		if (this.state.entry==null){
			return <CircularProgress />
		}
		return(
			<Card>
				<CardContent>
					<ShowMeta
						value={[
							{
							// '@id': props.data.id,
							// '@name': props.data.processed.name.text,
							'meta': this.state.entry.meta,
							},
						]}
                    />
				</CardContent>
			</Card>
		)
	}
}