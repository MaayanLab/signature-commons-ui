import React from 'react'
import PropTypes from 'prop-types'
import {
	BarChart, Bar, Cell, XAxis, YAxis, LabelList, Tooltip,
} from 'recharts';
import Lazy from '../Lazy'

const renderCustomizedLabel = (props) => {
	const {
	  x, y, width, height, value,
	} = props;
	const radius = 10;
	return (
	  <g>
		<text x={x+5} y={y+(height/2) + 4} width={width-x-5} fill="#000">
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
	const {barChartProps, barProps, field, data, color="#0063ff", fontColor="#FFF"} = props
	return(
		<BarChart layout="vertical" height={400} width={900} data={data} {...barChartProps}>
			<Tooltip content={<CustomTooltip/>} />
			<Bar dataKey="value" fill={color} {...barProps}>
				<LabelList dataKey="name" position="insideLeft" content={renderCustomizedLabel} fill={fontColor}/>
				{data.map((entry, index) => {
					return <Cell key={`${field}-${index}`} fill={entry.color} />
				}
				)}
			</Bar>
			<XAxis type="number" domain={[dataMin => dataMin-(dataMin/100), 'dataMax']} hide/>
			<YAxis type="category" hide />
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