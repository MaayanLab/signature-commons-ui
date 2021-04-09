import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import Lazy from '../Lazy'
import { useRechartToPng } from "recharts-to-png";
import FileSaver from "file-saver";
import Downloads from '../Downloads'
import Grid from '@material-ui/core/Grid'

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
	const { data,
		scatterProps,
		scatterChartProps,
		yAxisName,
		xAxisName,
		yAxisLabel,
		xAxisLabel,
		height=350,
		width=450,
		filename="scatter",
		download=false,
	} = props
	// const [png, ref] = useRechartToPng();
	// const handleDownload = React.useCallback(async () => {
	// 	// Use FileSaver to download the PNG
	// 	FileSaver.saveAs(png, `${filename}.png`);
	//   }, [png]);
	return (
		<Grid container>
			{/* { download ?
				<Grid item xs={12} align="right" style={{marginRight: 10}}>
					<Downloads 
						data={[
							{
								text: `Download Scatter Plot`,									
								onClick: handleDownload,
								icon: "mdi-download"
							}
						]} 
					/>
				</Grid>: null
			} */}
			<Grid item xs={12}>
				<ScatterChart
					width={width}
					height={height}
					margin={{
					top: 20, right: 20, bottom: 20, left: 20,
					}}
					// ref={ref}
					{...scatterChartProps}
				>
					<CartesianGrid />
					<YAxis type="number"
						dataKey="yAxis"
						name={yAxisName}
						label={{ value: yAxisLabel || yAxisName, angle: -90, position: 'left'}}/>
					<XAxis type="number"
						dataKey="xAxis"
						name={xAxisName}
						label={{ value: xAxisLabel || xAxisName, position: 'bottom' }}/>
					<Tooltip content={<CustomTooltip/>} position={{x:0, y:0}}/>
					<Scatter name="Enrichment" data={data} {...scatterProps}>
						{data.map((entry, index) => {
							return <Cell key={`scatter-${index}`} fill={entry.color} />
						}
						)}
					</Scatter>
				</ScatterChart>
			</Grid>
		</Grid>
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
  