import React from 'react';

function escapedVariableRegExp(str, flags) {
  return new RegExp(str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags)
}

export function Highlight({
  Component,
  TextComponent,
  HighlightComponent,
  text,
  highlight,
  props,
}) {
  if(Component === undefined) Component = (props) => <div {...props}>{props.children}</div>
  if(TextComponent === undefined) TextComponent = (props) => <span {...props}>{props.children}</span>
  if(HighlightComponent === undefined) HighlightComponent = (props) => <b {...props}>{props.children}</b>

  const highlight_re = escapedVariableRegExp(highlight, 'ig')
  const matches = text.match(highlight_re)
  let n = 0

  return (
    <Component
      {...props}
    >
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
