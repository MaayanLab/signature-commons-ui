// Code taken from Rechart example
// http://recharts.org/en-US/examples/CustomActiveShapePieChart
import React, { PureComponent } from 'react'
import { PieChart as Chart, Pie, Sector, Text, ResponsiveContainer } from 'recharts'
import PropTypes from 'prop-types'

const ActiveShape = (props) => {
  const RADIAN = Math.PI / 180
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, count,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)

  return (
    <g>
      <Text x={cx}
        y={cy}
        dy={12}
        textAnchor="middle"
        fill={fill}
        width={100}
        fontSize={16}
      >{`${payload.name} (${count})`}</Text>
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
            innerRadius={170}
            outerRadius={190}
            onClick={this.props.onClick}
            isAnimationActive={false}
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

