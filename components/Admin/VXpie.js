import React from 'react';
import { Pie } from '@vx/shape';
import { Group } from '@vx/group';
import { scaleLinear, scaleOrdinal } from '@vx/scale';
import { interpolateBlues } from 'd3-scale-chromatic';
import { LegendOrdinal } from '@vx/legend';
import { withTooltip, TooltipWithBounds } from '@vx/tooltip';
import { withScreenSize } from '@vx/responsive';
import { localPoint } from '@vx/event';

import Grid from '@material-ui/core/Grid';



function LegendDemo({ title, children }) {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
    </div>
  );
}

const colorrange = {
                    "Libraries": ["#afdbaf", "#136313"],
                    "Entities": ["#d390e1", "#720b87"],
                    "Signatures": ["#75bef5", "#0367b4"]
                    }

const handleMouseOver = (event, datum, props) => {
  const coords = localPoint(event.target.ownerSVGElement, event);
  props.showTooltip({
    tooltipLeft: coords.x,
    tooltipTop: coords.y,
    tooltipData: datum
  });
};

  const white = '#ffffff';
  const black = '#000000';
export const DonutChart = withScreenSize(withTooltip(function({ ...props }){
  console.log(props.screenWidth)
  // data format {Tissue: Value}
  const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      hideTooltip,
      width,
      height,
      margin,
      data,
      radius,
      percentages
    } = props;
  console.log(percentages)
  const dataLabels = data.map(function(d){
    return(
      d.label
    )
  })
  const value = d => d.value;
  const centerY = (height) / 2;
  const centerX = (width) / 2;


  const sizeColorScale = scaleLinear({
    domain: [0, dataLabels.length],
    range: colorrange[props.selected_db]
  });

  const ordinalColorScale = scaleOrdinal({
  domain: dataLabels,
  range: dataLabels.map(function(b,i){
            return(
              sizeColorScale(i)
            )
          })
  });


  return (
    <div>
      <svg width={width} height={height}>
        <rect rx={14} width={width} height={height} fill="url('#pie-gradients')" />
        <Group top={centerY - margin.top} left={centerX}>
          <Pie
            data={data}
            pieValue={value}
            outerRadius={radius - 80}
            innerRadius={radius - 120}
            cornerRadius={3}
            padAngle={0}
          >
            {pie => {
              return pie.arcs.map((arc, i) => {
                const opacity = 1 / (i + 2);
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const { startAngle, endAngle } = arc;
                const hasSpaceForLabel = endAngle - startAngle >= 0.3;

                return (
                  <g key={`browser-${arc.data.label}-${i}`}>
                    <path d={pie.path(arc)}
                          fill={ordinalColorScale(dataLabels[i])}
                          onMouseMove={e => handleMouseOver(e, percentages[i], props)}
                          onMouseOut={hideTooltip}/>
                    {hasSpaceForLabel && (
                      <text
                        fill={black}
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize={6}
                        textAnchor="middle"
                      >
                        {arc.data.label}
                      </text>
                    )}
                  </g>
                );
              });
            }}
          </Pie>
        </Group>
      </svg>
      {tooltipOpen && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{fontSize: '7px'}}
        >
          <strong>{tooltipData.label}</strong>: {tooltipData.value}%
        </TooltipWithBounds>
      )}
    </div>
  );
}));