import React from "react";
import Plot from 'react-plotly.js';

export default function RadarChart(props) {
  return (
    <Plot
        layout={{
            polar: {
                radialaxis: {
                    visible: true,
                    range: Math.max(Object.values(props.data))
                },
            },
            showlegend: false,
        }}
        data={[{
            type: 'scatterpolar',
            r: Object.values(props.data),
            theta: Object.keys(props.data),
            fill: 'toself',
        }]}
    />
  )
}
