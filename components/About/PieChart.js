// Code taken from Rechart example
// http://recharts.org/en-US/examples/CustomActiveShapePieChart
import React, { PureComponent } from 'react'
import { PieChart as Chart, Pie, Sector, Text, ResponsiveContainer } from 'recharts'
import PropTypes from 'prop-types'

const ActiveShape = (props) => {
  const RADIAN = Math.PI / 180
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, count,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <Text x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        width={100}
        fontSize={16}>{payload.name}</Text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fontSize={12} fill="#333">{`${count}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fontSize={12} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}


export default class DonutChart extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 0,
    }
  }

  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    })
  };

  activeShape = (props) => {
    const { pie_chart_style } = this.props
    return <ActiveShape pie_chart_style={pie_chart_style} {...props}/>
  }

  render() {
    const { pie_chart_style } = this.props
    return (
      <ResponsiveContainer height={400} width={480}>
        <Chart>
          <Pie
            dataKey="count"
            activeIndex={this.state.activeIndex}
            activeShape={this.activeShape}
            data={this.props.data}
            onMouseEnter={this.onPieEnter}
            innerRadius={110}
            outerRadius={130}
            onClick={this.props.onClick}
            fill="linear-gradient(to bottom, rgb(124, 162, 206) 0%, rgb(179, 202, 225) 100%)"
            // onClick={this.handleClick}
            {...((pie_chart_style ||{}).Pie || {})}
          />
        </Chart>
      </ResponsiveContainer>
    )
  }
}

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    count: PropTypes.number ,
    name: PropTypes.string
  })).isRequired,
  onClick: PropTypes.func,
  pie_chart_style: PropTypes.object,
}

