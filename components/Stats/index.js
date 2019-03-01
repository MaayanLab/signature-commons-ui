import React from "react";
import ReactJson from 'react-json-view';
import ReactLoading from 'react-loading';
import { fetch_meta } from '../../util/fetch/meta';
import RadarChart from './RadarChart';

export default class Stats extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      library_stats: null,
      signature_stats: null,
      entity_stats: null,
    }
  }
  componentDidMount() {
    (async () => {
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
      this.setState({
        library_stats,
      })
    })();
    (async () => {
      const { response: signature_stats } = await fetch_meta('/signatures/key_count')
      this.setState({
        signature_stats,
      })
    })();
    (async () => {
      const { response: entity_stats } = await fetch_meta('/entities/key_count')
      this.setState({
        entity_stats,
      })
    })();
  }
  render() {
    return (
      <div className="root">
        <main>
          <fieldset>
            <legend>
              Library key_count
            </legend>
            {this.state.library_stats === null ? (
              <ReactLoading type="spokes"  color="#000" />
            ) : (
              <div>
                <RadarChart
                  data={this.state.library_stats}
                />
                <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
                  <ReactJson
                    src={JSON.parse(JSON.stringify(this.state.library_stats))}
                    collapsed={2}
                  />
                </div>
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend>
              Signature key_count
            </legend>
            {this.state.signature_stats === null ? (
              <ReactLoading type="spokes"  color="#000" />
            ) : (
              <div>
                <RadarChart
                  data={this.state.signature_stats}
                />
                <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
                  <ReactJson
                    src={JSON.parse(JSON.stringify(this.state.signature_stats))}
                    collapsed={2}
                  />
                </div>
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend>
              Entity key_count
            </legend>
            {this.state.entity_stats === null ? (
              <ReactLoading type="spokes"  color="#000" />
            ) : (
              <div>
                <RadarChart
                  data={this.state.entity_stats}
                />
                <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
                  <ReactJson
                    src={JSON.parse(JSON.stringify(this.state.entity_stats))}
                    collapsed={2}
                  />
                </div>
              </div>
            )}
          </fieldset>
        </main>
      </div>
    )
  }
}
