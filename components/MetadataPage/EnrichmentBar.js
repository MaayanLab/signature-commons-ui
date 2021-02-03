import React from 'react'
import PropTypes from 'prop-types'
import {
	BarChart, Bar, Cell, XAxis, YAxis, LabelList,
} from 'recharts';





export const EnrichmentBar = (props) => {
	const {barChartProps, barProps, field, data, color="#0063ff", fontColor="#FFF"} = props
	console.log(props)
	return(
		<BarChart layout="vertical" height={400} width={900} data={data} {...barChartProps}>
			<Bar dataKey="value" fill={color} label {...barProps}>
				<LabelList dataKey="name" position="insideLeft" fill={fontColor}/>
				{data.map((entry, index) => {
					return <Cell key={`${field}-${index}`} fill={entry.color} />
				}
				)}
			</Bar>
			<XAxis type="number" hide/>
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