import React from 'react'
import { build_svg_from_score } from 'fairshakeinsignia'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'


export default class Insignia extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ref: null,
            error: ''
        }
    }

    ref_callback = ref => {
        if (this.state.ref!==ref){
            this.setState({
                ref
            })
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.ref !== this.state.ref) {
            const { params } = this.props
            build_svg_from_score(this.state.ref, params)
        }
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