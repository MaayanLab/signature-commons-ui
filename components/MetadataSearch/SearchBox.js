import React from 'react';
import { Link } from 'react-router-dom'

const examples = ['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy']

export default class extends React.Component {
  render() {
    return (
      <form action="javascript:void(0);">
        <div className="input-field">
          <i className="material-icons prefix">search</i>
          <input
            id="searchBox"
            type="text"
            onChange={this.props.searchChange}
            value={this.props.search}
            className="active"
            placeholder="Search over half a million signatures"
            style={{
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.54)',
              borderRadius: '2px',
              border: 0,
              height: '36px',
              width: '350px',
              padding: '8px 8px 8px 60px',
              background: '#f7f7f7',
            }}
          />
          <span>&nbsp;&nbsp;</span>
          <Link
            to={{ pathname: '/MetadataSearch', search: `?q=${encodeURIComponent(this.props.search)}` }}
          >
            <button className="btn waves-effect waves-light" type="submit" name="action">Search
              <i className="material-icons right">send</i>
            </button>
          </Link>
        </div>
        {examples.map((example) => (
          <Link
            key={example}
            to={{ pathname: '/MetadataSearch', search: `?q=${encodeURIComponent(example)}` }}
          >
            <div
              className="chip grey white-text waves-effect waves-light"
            >
              {example}
            </div>
          </Link>
        ))}
      </form>
    )
  }
}
