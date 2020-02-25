import React from 'react'
import { build_svg_from_score } from 'fairshakeinsignia'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'
import * as d3 from 'd3'

export default class Insignia extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ref: null,
            error: '',
            reset: false
        }
        this.updating = false
    }

    ref_callback = ref => {
        if (this.state.ref === null && this.state.ref!==ref){
            this.setState({
                ref
            })
        }
    }

    svgContainer = () => (
        <div ref={this.ref_callback} style={{width: 40, height:40, ...styles}} ></div>
    )

    componentDidUpdate = async (prevProps, prevState) => {
        const { params } = this.props
        if (this.state.ref === null || this.updating === true) return
        this.updating = true
        for (const child of this.state.ref.children)
            this.state.ref.removeChild(child)
        await build_svg_from_score(this.state.ref, params)
        this.updating = false
    }

    render = () => {
        const { styles } = this.props
        return (
            <React.Fragment>
                { this.state.ref === null ? <CircularProgress />: null}
                <div ref={this.ref_callback} style={{width: 40, height:40, ...styles}} ></div>
            </React.Fragment>
        )
    }

}

Insignia.propTypes = {
    params: PropTypes.object.isRequired,
    styles: PropTypes.object
  }