import React from 'react'
import {
  BarChart as Chart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Text
} from 'recharts'


export const BarChart = ({ meta_counts, ui_values, ...props }) => {
  const { bar_chart_style } = { ...ui_values }
  return (
    <ResponsiveContainer
      {...bar_chart_style.ResponsiveContainer}>
      <Chart
        data={meta_counts}
        {...bar_chart_style.Chart}
      >
        <Bar dataKey="counts" {...bar_chart_style.Bar}/>
        <XAxis dataKey="name" {...bar_chart_style.XAxis} tick={<CustomTick />} hide={props.XAxis===undefined || !props.XAxis} />
        <YAxis dataKey="counts" {...bar_chart_style.YAxis} hide={props.YAxis===undefined || !props.YAxis} />
        <Tooltip {...bar_chart_style.Tooltip} />
      </Chart>
    </ResponsiveContainer>
  )
}