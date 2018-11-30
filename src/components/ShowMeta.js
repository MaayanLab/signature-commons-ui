import React from 'react';

export function ShowMeta(props) {
  if(typeof(props.value) === 'string' || typeof(props.value) === 'number' || typeof(props.value) === 'boolean') {
    return (
      <span>{props.value + ''}</span>
    )
  } else if(Array.isArray(props.value)) {
    return (
      <ul>
        {props.value.map((value, ind) => (
          <li key={ind}>
            <ShowMeta value={value} />
          </li>
        ))}
      </ul>
    )
  } else if(typeof props.value === 'object') {
    return (
      <ul>
        {Object.keys(props.value).filter((key) => !key.startsWith('$')).map((key, ind) => (
          <li key={key}>
            <b>{key}:</b>
            <div style={{ marginLeft: '5px' }}>
              <ShowMeta value={props.value[key]} />
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    console.error(props.value)
    return null
  }
}
