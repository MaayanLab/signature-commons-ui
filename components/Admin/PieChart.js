// Code taken from Rechart example
// http://recharts.org/en-US/examples/CustomActiveShapePieChart
import React, { PureComponent } from 'react';
import { PieChart as Chart, Pie, Sector, ResponsiveContainer } from 'recharts';

const ActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={10} {...props.pie_chart_style.Text_Label}>{payload.label}</text>
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fontSize={10} fill="#333">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fontSize={10} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


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
    });
  };

  activeShape = (props) => {
    const {pie_chart_style} = this.props.ui_values
    return <ActiveShape pie_chart_style={pie_chart_style} {...props}/>
  }

  handleClick = (entry, index, e) => {
    const {resources, disabled, ui_values} = this.props
    const resource_path = ui_values.preferred_name["Resources"] || 'Resources'
    if (disabled === undefined) {
      if (resources) {
        location.href = `#/${resource_path}/${entry.label.replace(/ /g, '_')}`
      } else {
        location.href = `#/MetadataSearch?q=${entry.label}`
      }
    }
  };

  render() {
    const {pie_chart_style} = this.props.ui_values
    return (
        <Chart {...pie_chart_style.Chart}>
          <Pie
            dataKey="value"
            activeIndex={this.state.activeIndex}
            activeShape={this.activeShape}
            data={this.props.data}
            onMouseEnter={this.onPieEnter}
            innerRadius={80}
            outerRadius={100}
            fill="#75bef5"
            onClick={this.handleClick}
            {...pie_chart_style.Pie}
          />
        </Chart>
    );
  }
}
