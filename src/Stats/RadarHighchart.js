import React from "react";
import Highcharts from 'highcharts-more'
import HighchartsReact from 'react-highcharts'

Highcharts(HighchartsReact.Highcharts)

export default function RadarHighchart(props) {
  return (
    <HighchartsReact
      config={{
        chart: {
            polar: true,
            type: 'area'
        },
        pane: {
            size: '80%'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: Object.keys(props.data),
            tickmarkPlacement: 'on',
            lineWidth: 0
        },
        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },
        series: [{
            name: 'Count',
            pointPlacement: 'on',
            data: Object.values(props.data),
        }]
      }}
    />
  )
}
