import React from 'react';

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
    }
    .icon-btn > span {
      line-height: 16px;
      text-align: center;
    }
    .icon-btn > a > img {
      position: relative;
      top: 50%;
      transform: translateY(-50%); 
      height: 24px;
      max-width: 48px;
    }
    .icon-btn:hover {
      background-color: #eee;
    }
    .icon-btn > .counter {
      position: absolute;
      top: -0.3em;
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
    >
      <a
        href="javascript:void(0);"
        className="btn btn-floating waves-effect waves-light grey lighten-3 center valign-wrapper"
      >
        {props.img !== undefined ? (
          <img
            alt={props.alt}
            src={props.img}
          />
        ) : (
          <i className="material-icons left black-text">{props.icon}</i>
        )}
      </a>
      <span>
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
