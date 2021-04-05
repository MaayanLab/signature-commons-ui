import React from 'react'
import PropTypes from 'prop-types'
import {
	BarChart, Bar, Cell, XAxis, YAxis, LabelList, Tooltip,
} from 'recharts';
import Lazy from '../Lazy'
import Color from 'color'

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
		<text x={transfomedX} y={y+(height/2) + 4} width={width} fill={fontColor} textAnchor={textAnchor}>
		  {value}
		</text>
	  </g>
	);
  };

  const CustomTooltip = ({ active, payload }) => {
	if (active) {
	  const {tooltip_component, ...rest} = payload[0].payload
	  return <Lazy reloader={rest.id}>{async () => tooltip_component(rest)}</Lazy>
	}
  
	return null;
  };

export const EnrichmentBar = (props) => {
	const {barChartProps,
		   barProps,
		   field,
		   data,
		   color="#0063ff",
		   fontColor="#FFF",
		   maxHeight=300,
		   barSize=23,
		   width=500,
		} = props
	const height = data.length === 10 ? maxHeight: maxHeight/10 * data.length
	return(
		<BarChart layout="vertical" height={height} width={width} data={data} {...barChartProps}>
			<Tooltip content={<CustomTooltip/>} />
			<Bar dataKey="value" fill={color} barSize={barSize} {...barProps}>
				<LabelList dataKey="name" position="left" content={renderCustomizedLabel} fill={fontColor}/>
				{data.map((entry, index) => {
					return <Cell key={`${field}-${index}`} fill={entry.color} />
				}
				)}
			</Bar>
			<XAxis type="number" domain={[
				dataMin => {
					if (dataMin < 0) {
						return dataMin
					} else {
						return dataMin-(dataMin/100)
					}
				},
				dataMax => {
					if (dataMax > 0) {
						return dataMax
					} else {
						return dataMax-(dataMax/100)
					}
				},
			]} hide/>
			<YAxis type="category" hide/>
		</BarChart>
	)
}

EnrichmentBar.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		value: PropTypes.number.isRequired,
		color: PropTypes.string,
	})).isRequired,
	fontColor: PropTypes.string,
	barProps: PropTypes.object,
	barChartProps: PropTypes.object,
}