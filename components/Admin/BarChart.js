import React from 'react'
import {
  BarChart as Chart, Bar, XAxis, Tooltip, ResponsiveContainer,
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
        <XAxis dataKey="name" {...bar_chart_style.XAxis}/>
        <Tooltip {...bar_chart_style.Tooltip}/>
        <Bar dataKey="counts" {...bar_chart_style.Bar} />
      </Chart>
    </ResponsiveContainer>
  )
}