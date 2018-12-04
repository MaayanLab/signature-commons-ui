import React from 'react';
import { Highlight } from './Highlight';

export function ShowMeta({value, highlight}) {
  if(typeof(value) === 'string' || typeof(value) === 'number' || typeof(value) === 'boolean') {
    return (
      <Highlight
        Component={(props) => <span {...props}>{props.children}</span>}
        text={value+''}
        highlight={highlight}
      />
    )
  } else if(Array.isArray(value)) {
    return (
      <ul>
        {value.map((value, ind) => (
          <li key={ind}>
            <ShowMeta value={value} highlight={highlight} />
          </li>
        ))}
      </ul>
    )
  } else if(typeof value === 'object') {
    return (
      <ul>
        {Object.keys(value).filter((key) => !key.startsWith('$')).map((key, ind) => (
          <li key={key}>
            <Highlight
              Component={(props) => <b {...props}>{props.children}</b>}
              HighlightComponent={(props) => <i {...props}>{props.children}</i>}
              text={key+':'}
              highlight={highlight}
            />
            <div style={{ marginLeft: '5px' }}>
              <ShowMeta value={value[key]} highlight={highlight} />
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    console.error(value)
    return null
  }
}
