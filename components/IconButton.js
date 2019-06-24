import React from 'react'

const IconButton = (props) => (
  <div>
    <style jsx>{`
    .icon-btn {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      border-radius: 15px;
      width: 100px;
      min-height: 100px;
      overflow: visible;
      color: black;
    }
    .icon-btn > span {
      line-height: 16px;
      text-align: center;
    }
    .icon-btn > div > img {
      position: relative;
      top: 50%;
      height: 24px;
      max-width: 48px;
    }
    .icon-btn:hover {
      background-color: #eee;
    }
    .icon-btn > .counter {
      position: absolute;
      top: 0.3em;
      font-size: 75%;
      left: 5em;
      line-height: 2.2em;
      z-index: 100;
      color: white;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      text-align: center;
      vertical-align: middle;
    }
    `}</style>
    <div
      className="left icon-btn waves-effect waves-light"
      onClick={props.onClick}
      style={props.style}
    >
      <div>
        {props.img !== undefined ? (
          <img
            alt={props.alt}
            src={props.img}
          />
        ) : (
          <i className="material-icons left black-text">{props.icon}</i>
        )}
      </div>
      <span style={{fontSize:10}}>
        {props.alt}
      </span>
      {props.counter === undefined ? null : (
        <div className="counter red lighten-1">
          {props.counter}
        </div>
      )}
    </div>
  </div>
)

export default IconButton
