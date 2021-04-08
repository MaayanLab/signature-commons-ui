import React from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import CircularProgress from '@material-ui/core/CircularProgress'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export default class MarkdownComponent extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			markdown: undefined
		}
	}
	componentDidMount = async () => {
		const {url} = this.props
		if (url === null || url === undefined || url === '') {
			this.setState({
				markdown: null
			})
		}else {
			const markdown = await (await fetch(url)).text()
			this.setState({markdown})
		}
	}

	render = () => {
		if (this.state.markdown === undefined ) return <CircularProgress/>
		else if (this.state.markdown === null ) return null
		else return <ReactMarkdown plugins={[gfm]} children={this.state.markdown}/>
	}
}

MarkdownComponent.propTypes = {
	url: PropTypes.string
}