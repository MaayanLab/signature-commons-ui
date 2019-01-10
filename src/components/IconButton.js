import React from 'react';
import Style from 'style-it';

const IconButton = (props) => Style.it(`
  .icon-btn {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 15px;
    width: 100px;
    min-height: 100px;
  }
  .icon-btn > span {
    line-height: 12px;
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
  `, (
  <div
    className="left icon-btn waves-effect waves-light"
    onClick={props.onClick}
  >
    <a
      href="#!"
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
  </div>
))

export default IconButton
