import React from 'react';
import Style from 'style-it';

const IconButton = (props) => Style.it(`
  .icon-btn {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 15px;
    width: 150px;
    height: 100px;
  }
  .icon-btn > span {
    line-height: 12px;
  }
  .icon-btn:hover {
    background-color: #eee;
  }
  `, (
  <div className="icon-btn waves-effect waves-light">
    <a
      href="#!"
      className="btn btn-floating waves-effect waves-light grey lighten-3 center valign-wrapper"
      onClick={props.onClick}
    >
      {props.img !== undefined ? (
        <img
          alt={props.alt}
          src={props.img}
          style={{
            position: 'relative',
            top: '50%',
            transform: 'translateY(-50%)', 
            maxWidth: 48,
            maxHeight: 24,
          }}
        />
      ) : (
        <i className="material-icons left black-text">{props.icon}</i>
      )}
    </a>
    <span>
      {props.alt}
    </span>
  </div>
))

export default IconButton
