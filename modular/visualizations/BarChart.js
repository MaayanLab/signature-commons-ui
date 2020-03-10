import React from 'react'
import {
  BarChart as Chart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Text,
} from 'recharts'
import PropTypes from 'prop-types'

const articles = ['a', 'of', 'the', 'for', 'and', 'at']

export const CustomTick = (props) => {
  const {
    x, y, payload,
  } = props
  let value = payload.value
  if (value.length > 23) {
    value = value.split('(')[0]
    if (value.length > 23){
      value = value.split(',')[0].replace(/-/g, ' ').split(' ').filter((v) => articles.indexOf(v.toLowerCase()) === -1).map((v) => v[0]).join('')// .split(",").join(", ")
    }
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <Text x={0} y={0} dy={16} angle={-30} fontSize={12} textAnchor={'end'}>{value}</Text>
    </g>
  )
}
export default class BarChart extends React.Component {
  render = () => {
    const {
      stats,
      endpoint,
      clickTerm,
      responsiveProps,
      chartProps,
      tooltipProps,
      barProps,
      xAxisProps,
      yAxisProps,
      ...rest
    } = this.props
    return (
      <ResponsiveContainer {...responsive}>
        <Chart
          data={stats}
          {...bar}
        >
          <Tooltip {...tooltip} />
          <Bar dataKey="count" {...bar} 
            onClick={(data)=>clickTerm(endpoint, data.name)}
          />
          <XAxis dataKey="name" {...xAxis} tick={<CustomTick />} hide={!rest.XAxis} />
          <YAxis dataKey="counts" type="number" {...bar_chart_style.YAxis} hide={!rest.YAxis} />
        </Chart>
      </ResponsiveContainer>
    )
  }
}

export const BarChart = ({ meta_counts, ui_values, searchTerm, searchTable, ...props }) => {
  const { bar_chart_style } = { ...ui_values }
  return (
    <ResponsiveContainer
      {...bar_chart_style.ResponsiveContainer}>
      <Chart
        data={meta_counts}
        {...bar_chart_style.Chart}
      >
        <Tooltip {...bar_chart_style.Tooltip} />
        <Bar dataKey="counts" {...bar_chart_style.Bar} 
            onClick={(data)=>searchTerm(ui_values, searchTable, data)}
        />
        <XAxis dataKey="name" {...bar_chart_style.XAxis} tick={<CustomTick />} hide={props.XAxis === undefined || !props.XAxis} />
        <YAxis dataKey="counts" type="number" {...bar_chart_style.YAxis} hide={props.YAxis === undefined || !props.YAxis} />
      </Chart>
    </ResponsiveContainer>
  )
}

BarChart.propTypes = {

}