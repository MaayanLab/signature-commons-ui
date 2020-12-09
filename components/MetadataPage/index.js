import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import {DataTable, ShowMeta} from '../DataTable'
import DataResolver from '../../connector/data_resolver'
import CircularProgress from '@material-ui/core/CircularProgress'
import { labelGenerator } from '../../util/ui/labelGenerator'
import PropTypes from 'prop-types'


export default class MetadataPage extends React.PureComponent {
	constructor(props){
		super(props)
		this.state = {
			resolver: new DataResolver(),
			entry: null
		}
	}

	process_entry = async () => {
		const {model, id, schemas} = this.props
		const {resolved_entries} = await this.state.resolver.resolve_entries({model, entries: [id]})
		const entry_object = resolved_entries[id]
		const entry = labelGenerator(await entry_object.entry(), schemas)
		const parent = labelGenerator(await entry_object.parent(), schemas)
		const children_object = await entry_object.children()
		const children_count = children_object.count
		const children_results = children_object[entry_object.child_model]

		let children
		if (entry_object.model === "entities"){
			children = {}
			for (const [k,v] of Object.entries(children_results)){
				children[k] = v.map(c=>labelGenerator(c, schemas))
			}
		}else {
			children = Object.values(children_results).map(c=>labelGenerator(c, schemas))	
		}
		this.setState({
			entry_object,
			entry,
			parent,
			children_count,
			children
		})
	}

	componentDidMount = async () => {
		await this.process_entry()	
	}

	componentDidUpdate = async (prevProps) => {
		if (prevProps.id !== this.props.id){
			await this.process_entry()
		}
	}

	render = () => {
		if (this.state.entry==null){
			return <CircularProgress />
		}
		return(
			<React.Fragment>
				<Card>
					<CardContent>
						<ShowMeta
							value={[
								{
								// '@id': props.data.id,
								// '@name': props.data.processed.name.text,
								'meta': this.state.entry.data.meta,
								},
							]}
						/>
					</CardContent>
				</Card>
				{this.state.entry_object.model==="entities"?null:
					<DataTable entries={this.state.children}/>
				}
			</React.Fragment>
		)
	}
}

MetadataPage.propTypes = {
	model: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	schemas: PropTypes.array.isRequired,
}