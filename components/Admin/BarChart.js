import React from 'react'
import {
  BarChart as Chart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer, Text
} from 'recharts';


// accessors
const x = (d) => d.name.replace('_', ' ')
const y = (d) => +d.counts

export const BarChart = ({ meta_counts, ui_values, ...props }) => {
  const {bar_chart_style} = {...ui_values}
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
    );
}
