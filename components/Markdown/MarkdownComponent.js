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
			markdown: null
		}
	}
	componentDidMount = async () => {
		const {url} = this.props
		const markdown = await (await fetch(url)).text()
		this.setState({markdown})
	}

	render = () => {
		if (this.state.markdown === null ) return <CircularProgress/>
		return <ReactMarkdown plugins={[gfm]} children={this.state.markdown}/>
	}
}

MarkdownComponent.propTypes = {
	url: PropTypes.string
}