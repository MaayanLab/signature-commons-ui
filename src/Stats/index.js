import React from "react";
import ReactLoading from 'react-loading';
import ReactJson from 'react-json-view';
import { fetch_meta } from '../fetch/meta';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

class TwoLevelPieChart extends React.Component {
  render () {
    return (
      <RadarChart
        cx="50%"
        cy="50%"
        outerRadius={300}
        width={1000}
        height={1000}
        data={this.props.data}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis />
        <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
      </RadarChart>
    );
  }
}

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
      this.setState({
        library_stats: await fetch_meta('/libraries/key_count'),
      })
    })();
    (async () => {
      this.setState({
        signature_stats: await fetch_meta('/signatures/key_count'),
      })
    })();
    (async () => {
      this.setState({
        entity_stats: await fetch_meta('/entities/key_count'),
      })
    })();
  }
  render() {
    return (
      <div>
        <fieldset>
          <legend>
            Library key_count
          </legend>
          {this.state.library_stats === null ? (
            <ReactLoading type="spokes"  color="#000" />
          ) : (
            <div>
              <TwoLevelPieChart
                data={Object.keys(this.state.library_stats).map((k) => ({
                  name: k,
                  value: this.state.library_stats[k],
                }))}
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
              <TwoLevelPieChart
                data={Object.keys(this.state.signature_stats).map((k) => ({
                  name: k,
                  value: this.state.signature_stats[k],
                }))}
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
              <TwoLevelPieChart
                data={Object.keys(this.state.entity_stats).map((k) => ({
                  name: k,
                  value: this.state.entity_stats[k],
                }))}
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
      </div>
    )
  }
}
