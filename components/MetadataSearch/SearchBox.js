import React from 'react'
import config from '../../ui-schemas/MetadataSearch'

export default class MetadataSearchBox extends React.Component {
  render() {
    const examples = this.props.ui_values.LandingText.search_terms || config.examples
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
            placeholder={this.props.ui_values.LandingText.metadata_placeholder || config.placeholder}
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
          <button className="btn waves-effect waves-light" type="submit" name="action" onClick={() => {
            this.props.currentSearchChange(this.props.search)
          }}>Search
            <i className="material-icons right">send</i>
          </button>
        </div>
        {examples.map((example) => (
          <a
            className="chip grey white-text waves-effect waves-light"
            onClick={() => {
              this.props.currentSearchChange(example)
            }}
            key={example}
          >
            {example}
          </a>
        ))}
      </form>
    )
  }
}
