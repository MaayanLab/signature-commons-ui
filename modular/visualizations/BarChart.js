import React from 'react'
import {
  BarChart as Chart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Text,
} from 'recharts'
import PropTypes from 'prop-types'

const articles = ['a', 'of', 'the', 'for', 'and', 'at']

// Can be passed to xAxis as <XAxis tick={customTick} /> to provide short names
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
      responsiveProps,
      chartProps,
      tooltipProps,
      barProps,
      xAxisProps,
      yAxisProps,
      endpoint,
      clickTerm,
      funcProps,
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
            onClick={(data)=>clickTerm(endpoint, data.name, funcProps)}
          />
          <XAxis dataKey="name" {...xAxis} tick={<CustomTick />} hide={!rest.XAxis} {...xAxisProps} />
          <YAxis dataKey="counts" type="number" {...bar_chart_style.YAxis} hide={!rest.YAxis} {...yAxisProps}/>
        </Chart>
      </ResponsiveContainer>
    )
  }
}

BarChart.propTypes = {
  /* Count stats */
  stats: PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
    })
  ).isRequired,
  /* Props passed to rechart ResponsiveContainer */
  responsiveProps: PropTypes.object,
  /* Props passed to rechart BarChart */
  chartProps: PropTypes.object,
  /* Props passed to rechart Tooltip */
  tooltipProps: PropTypes.object,
  /* Props passed to rechart Bar */
  barProps: PropTypes.object,
  /* Props passed to rechart XAxis */
  xAxisProps: PropTypes.object,
  /* Props passed to rechart YAxis */
  yAxisProps: PropTypes.object,
  /* Function triggered upon clicking a term. The following are passed to the function (endpoint, termClicked, funcProps) */
  clickTerm: PropTypes.func,
  /* endpoint that is passed to clickTerm */
  endpoint: PropTypes.string,
  /* extra props to pass to the clickTerm function */
  funcProps: PropTypes.object,
}