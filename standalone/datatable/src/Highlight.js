import React from 'react'
import PropTypes from 'prop-types'

function escapedVariableRegExp(terms, flags) {
    const terms_escaped = terms.map((term) => term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')
    return new RegExp(terms_escaped, flags)
  }

export function Highlight({
    Component,
    TextComponent,
    HighlightComponent,
    text,
    highlight,
    props,
  }) {
    if (Component === undefined) Component = (props) => <div {...props}>{props.children}</div>
    if (TextComponent === undefined) TextComponent = (props) => <span {...props}>{props.children}</span>
    if (HighlightComponent === undefined) HighlightComponent = (props) => <b {...props}>{props.children}</b>
  
    if (highlight === undefined) {
      return (
        <Component {...props}>
          <TextComponent>{text}</TextComponent>
        </Component>
      )
    }
  
    const highlight_re = escapedVariableRegExp(highlight, 'ig')
    const matches = text.match(highlight_re)
    let n = 0
  
    return (
      <Component {...props}>
        {
          text.split(
              highlight_re
          ).map((s, ind) =>
            <TextComponent key={ind}>{s}</TextComponent>
          ).reduce(
              (prev, cur, ind) =>
                [
                  prev,
                  <HighlightComponent key={ind + '.5'}>
                    {matches[n++]}
                  </HighlightComponent>,
                  cur,
                ]
          )
        }
      </Component>
    )
  }
  
  Highlight.propTypes = {
    Component: PropTypes.func,
    TextComponent: PropTypes.func,
    HighlightComponent: PropTypes.func,
    text: PropTypes.string,
    highlight: PropTypes.arrayOf(PropTypes.string),
  }