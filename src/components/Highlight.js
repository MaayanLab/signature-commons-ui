import React from 'react';

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

  return (
    <Component
      {...props}
    >
      {
        text.split(
          highlight
        ).map((s, ind) =>
          <TextComponent key={ind}>{s}</TextComponent>
        ).reduce(
          (prev, cur, ind) =>
            [
              prev,
              <HighlightComponent key={ind + '.5'}>
                {highlight}
              </HighlightComponent>,
              cur,
            ]
        )
      }
    </Component>
  )
}
