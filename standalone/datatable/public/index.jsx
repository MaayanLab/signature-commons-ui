import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

window.onload = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)

  ReactDOM.render((
    <App />
  ), el)
}