import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { precise } from '../ScorePopper'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
	if (active) {
		const {
				name,
				id,
				xName,
				yName,
				zName,
				xAxis,
				yAxis,
				zValue,
				category,
				primary_label,
				primary_value,
			} = payload[0].payload
		return (
			<Card style={{opacity:"0.8", textAlign: "left"}}>
				<CardContent>
					<Typography variant="h6">{name}</Typography>
					<Typography><b style={{textTransform: "lowercase"}}>{primary_label}:</b> {primary_value}</Typography>
					{Object.entries(category).map(([k,v])=><Typography key={k}><b style={{textTransform: "lowercase"}}>{k}:</b> {v}</Typography>)}
					<Typography><b>{xName}:</b> {precise(xAxis)}</Typography>
					<Typography><b>{yName}:</b> {precise(yAxis)}</Typography>	
				</CardContent>
			</Card>
		)
	}
  
	return null;
  };

const renderColorfulLegendText = (value, entry) => {
	const {color} = value

	return <span style={{color, fontSize: 11}}>{value}</span>;
};

export const ScatterPlot = (props) => {
	const { data,
		scatterProps,
		scatterChartProps,
		yAxisName,
		xAxisName,
		yAxisLabel,
		xAxisLabel,
		height=400,
		width="100%",
		category,
	} = props
	// const [png, ref] = useRechartToPng();
	// const handleDownload = React.useCallback(async () => {
	// 	// Use FileSaver to download the PNG
	// 	FileSaver.saveAs(png, `${filename}.png`);
	//   }, [png]);
	const {scatter_data=[], colorize={}} = data
	return (
		<ResponsiveContainer 
			width={width}
			height={height}
		>
			<ScatterChart
				margin={{
					top: 20, right: 20, bottom: 20, left: 20,
				}}
				// ref={ref}
				{...scatterChartProps}
			>
				<CartesianGrid />
				<YAxis type="number"
					dataKey="yAxis"
					// domain={[dataMin => (Math.floor(dataMin + dataMin/5)), dataMax => (Math.ceil(dataMax+ dataMax/5))]}
					domain={['auto', 'auto']}
					name={yAxisName}
					label={{ value: yAxisLabel || yAxisName, angle: -90, position: 'left'}}/>
				<XAxis type="number"
					dataKey="xAxis"
					// domain={[dataMin => (Math.floor(dataMin + dataMin/5)), dataMax => (Math.ceil(dataMax+ dataMax/5))]}
					domain={['auto', 'auto']}
					name={xAxisName}
					label={{ value: xAxisLabel || xAxisName, position: 'bottom' }}/>
				<Tooltip content={<CustomTooltip/>}/>
				<Legend formatter={renderColorfulLegendText}
						verticalAlign="top"
						align="left"
						layout="vertical"
						iconSize={10}
						width={100}
						payload={Object.entries(colorize[category]||{}).slice(0,30).map(([value, color])=>({value, color, type: "circle"}))}
				/>
				<Scatter name="Enrichment" data={scatter_data} {...scatterProps}>
					{scatter_data.map((entry, index) => {
						const fill = colorize[category][entry.category[category]]
						return <Cell key={`scatter-${index}`} fill={fill} />
					}
					)}
				</Scatter>
			</ScatterChart>
		</ResponsiveContainer>
	);
}

ScatterPlot.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
	})).isRequired,
	color: PropTypes.string.isRequired,
	scatterProps: PropTypes.object,
	scatterChartProps: PropTypes.object,
	yAxisName: PropTypes.string,
	xAxisName: PropTypes.string,
	yAxisLabel: PropTypes.string,
	xAxisLabel: PropTypes.string,
}
  