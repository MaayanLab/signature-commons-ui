import React from 'react'
import {
  BarChart as Chart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Text
} from 'recharts'

const articles = ["a", "of", "the", "for", "and"]

const CustomTick = (props) => {
  const {
    x, y, stroke, payload
  } = props
  let value = payload.value
  if (value.length > 23){
    value = value.split(",")[0].split(" ").filter(v=>articles.indexOf(v.toLowerCase())===-1).map(v=>v[0]).join("")//.split(",").join(", ")
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <Text  x={0} y={0} dy={16} angle={-30} fontSize={12} textAnchor={"end"}>{value}</Text>
    </g>
  )
}

export const BarChart = ({ meta_counts, ui_values, ...props }) => {
  const { bar_chart_style } = { ...ui_values }
  return (
    <ResponsiveContainer
      {...bar_chart_style.ResponsiveContainer}>
      <Chart
        data={meta_counts}
        {...bar_chart_style.Chart}
      >
        {props.XAxis ? <XAxis dataKey="name" {...bar_chart_style.XAxis} tick={<CustomTick />}/>: null}
        {props.YAxis ? <YAxis dataKey="counts" {...bar_chart_style.YAxis}/>: null}
        <Tooltip {...bar_chart_style.Tooltip} />
        <Bar dataKey="counts" {...bar_chart_style.Bar}/>
      </Chart>
    </ResponsiveContainer>
  )
}