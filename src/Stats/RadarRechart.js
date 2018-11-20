import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default class TwoLevelPieChart extends React.Component {
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
