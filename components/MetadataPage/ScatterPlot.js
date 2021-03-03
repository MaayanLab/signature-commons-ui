import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import Lazy from '../Lazy'


import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
	if (active) {
		const {tooltip_component, ...rest} = payload[0].payload
		return <Lazy reloader={rest.id}>{async () => tooltip_component(rest)}</Lazy>
	}
  
	return null;
  };

export const ScatterPlot = (props) => {
	const { data, color, scatterProps, scatterChartProps} = props
	return (
		<ScatterChart
			width={400}
			height={400}
			margin={{
			top: 20, right: 20, bottom: 20, left: 20,
			}}
			{...scatterChartProps}
		>
			<CartesianGrid />
			<YAxis type="number"
				dataKey="logpval"
				name="p-value"
				label={{ value: '-log(p-value)', angle: -90, position: 'left'}}/>
			<XAxis type="number"
				dataKey="oddsratio"
				name="odds ratio"
				label={{ value: 'odds ratio', position: 'bottom' }}/>
			<Tooltip content={<CustomTooltip/>} position={{x:0, y:0}}/>
			<Scatter name="Enrichment" data={data} {...scatterProps}>
				{data.map((entry, index) => {
					return <Cell key={`scatter-${index}`} fill={entry.color} />
				}
				)}
			</Scatter>
		</ScatterChart>
	);
}

ScatterPlot.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		pval: PropTypes.number.isRequired,
		oddsratio: PropTypes.number.isRequired,
	})).isRequired,
	color: PropTypes.string.isRequired,
	scatterProps: PropTypes.object,
	scatterChartProps: PropTypes.object,
}
  