import React from 'react'
import PropTypes from 'prop-types'
import {
	BarChart, Bar, Cell, XAxis, YAxis, LabelList, Tooltip,
} from 'recharts';
import Lazy from '../Lazy'
import Color from 'color'
import { useRechartToPng } from "recharts-to-png";
import FileSaver from "file-saver";
import Downloads from '../Downloads'
import Grid from '@material-ui/core/Grid'

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
		   width=450,
		   filename="bar",
		   download=false,
		} = props
	// const [png, ref] = useRechartToPng();
	// const handleDownload = React.useCallback(async () => {
	// 	// Use FileSaver to download the PNG
	// 	FileSaver.saveAs(png, `${filename}.png`);
	//   }, [png]);
	  const height = data.length === 10 ? maxHeight: maxHeight/10 * data.length
	return(
		<Grid container>
			{/* { download ?
				<Grid item xs={12} align="right" style={{marginRight: 10}}>
					<Downloads 
						data={[
							{
								text: `Download Bar Chart`,									
								onClick: handleDownload,
								icon: "mdi-download"
							}
						]} 
					/>
				</Grid>: null
			} */}
			<Grid item xs={12}>
				<BarChart
					layout="vertical"
					height={height}
					width={width}
					data={data}
					{...barChartProps}
					// ref={ref} // Save the ref of the chart
				>
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
			</Grid>
		</Grid>
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