import React from 'react'
import PropTypes from 'prop-types'
import ReactWordcloud from 'react-wordcloud'


export default class WordCloud extends Component {
    
    getCallback = (callback, endpoint, callbackProps) => {
        const { clickTerm } = this.props
        return function(word) {
            if (typeof(clickTerm) === func ){
                clickTerm(endpoint, word.text, callbackProps)
            }
        }
    }

    // endpoint = `#${nav.MetadataSearch.endpoint}/${preferred_name[searchTable]}?q={"search":["${term.name}"]}`
    render = () => {
        const {stats, wordcloudProps, callbackProps, ...rest} = this.props
        if (stats === null || stats === undefined ){
            return null
        } else{
            const wordstats = stats.map(function(entry) {
                return ({ 'text': entry.name, 'value': entry.count })
            })
            wordstats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
            return (
                <div style={{ width: "100%",
                        height: 420,
                        display: 'block',
                        margin: 'auto' }}
                      {...rest}
                >
                  <ReactWordcloud words={wordstats}
                    callbacks={{
                      onWordClick: getCallback('onWordClick', this.props.endpoint, callbackProps)
                    }}
                    scale={'log'}
                    options={{
                      colors: ['#000'],
                      scale: 'log',
                      rotations: 3,
                      rotationsAngles: [0, 90],
                    }}
                    {...wordcloudProps} 
                    />
                </div>
              )
        }
    }
}
WordCloud.PropTypes = {
    /* Count stats */
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
        })
    ).isRequired,
    /* props passed to ReactWordCloud */
    wordcloudProps: PropTypes.object,
    /* Function triggered upon clicking a term. The following are passed to the function (endpoint, termClicked, callbackProps) */
    clickTerm: PropTypes.func,
    /* endpoint that is passed to clickTerm */
    endpoint: PropTypes.string,
    /* extra props to pass to the callback function */
    callbackProps: PropTypes.object,
}