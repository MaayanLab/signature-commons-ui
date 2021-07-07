import React from 'react'
import PropTypes from 'prop-types'
import {
	BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import Lazy from '../Lazy'
import Color from 'color'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const renderCustomizedLabel = (props) => {
	const {
	  x, y, width, height, value, color
	} = props;
	// const radius = 10;
	const background = Color(color)
	const fontColor = background.isDark() ? "#FFF": "#000"
	const transfomedX = width < 0 ? x-5: x+5
	const textAnchor = width < 0 ? "end": "start"
	return (
	  <g>
		<text x={transfomedX} y={y+(height/2) + 4} width={width} fill={fontColor} textAnchor={textAnchor} fontSize={11}>
		  {value}
		</text>
	  </g>
	);
  };

  const CustomTooltip = ({ active, payload }) => {
	if (active) {
	  const {name, count, count_name} = payload[0].payload
	  return (
		<Card style={{opacity:"0.8", textAlign: "left"}}>
			<CardContent>
				<Typography variant="subtitle2"><b>{name}</b></Typography>
				<Typography variant="subtitle2">{count_name || count}</Typography>
			</CardContent>
		</Card>
	  )
	}
  
	return null;
  };

export const HorizontalBarChart = (props) => {
	const {barChartProps,
		   barProps,
		   onClick,
		   data,
		   color="#0063ff",
		   barSize=23,
		   scale
		} = props
	return(
		<ResponsiveContainer height={400} width={700}>
			<BarChart
				layout="vertical"
				height={400}
				width={600}
				data={data}
				{...barChartProps}
				// ref={ref} // Save the ref of the chart
			>
			<Tooltip content={<CustomTooltip/>} />
			<Bar dataKey="count"
				fill={color}
				barSize={barSize}
				onClick={onClick} 
				isAnimationActive={false}
				{...barProps}/>
			<XAxis type="number"
				domain={[0.01, 'dataMax']}
				scale={scale}
				hide/>
			<YAxis type="category" dataKey="name" interval={0} axisLine={false} width={125}/>
			</BarChart>
		</ResponsiveContainer>
	)
}

HorizontalBarChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
		count: PropTypes.number ,
		name: PropTypes.string
	  })).isRequired,
	fontColor: PropTypes.string,
	barProps: PropTypes.object,
	barChartProps: PropTypes.object,
}

export default HorizontalBarChart