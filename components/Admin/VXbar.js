import React from 'react';
import { Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { GradientTealBlue } from '@vx/gradient';
import { scaleBand, scaleLinear } from '@vx/scale';
import { AxisBottom } from '@vx/axis';
import { withTooltip, TooltipWithBounds } from '@vx/tooltip'
import { localPoint } from '@vx/event'

// accessors
const x = d => d.name.replace('_', ' ');
const y = d => +d.counts;

const black = '#000';
const white = '#fff';

const handleMouseOver = (event, datum, props) => {
  const coords = localPoint(event.target.ownerSVGElement, event)

  props.showTooltip({
    tooltipLeft: coords.x,
    tooltipTop: coords.y,
    tooltipData: datum,
  })
}


export const BarChart = withTooltip(({ width, height, meta_counts, fontSize, ...props}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hideTooltip,
  } = props
  // bounds
  const xMax = width;
  const yMax = height - 120;

  const margin = { top: 40 }

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: meta_counts.map(x),
    padding: 0.4
  });
  const yScale = scaleLinear({
    rangeRound: [yMax, 0],
    domain: [0, Math.max(...meta_counts.map(y))]
  });
  return (
    <div>
      <svg width={width} height={height} style={{display: "block", margin:"auto"}}>
        <rect width={width} height={height} fill={"#fff"} rx={14} />
        <Group top={40}>
          {meta_counts.map((d, i) => {
            const meta_field = x(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - yScale(y(d));
            const barX = xScale(meta_field);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${meta_field}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#75bef5"
                onMouseMove={(e) => handleMouseOver(e, meta_counts[i], props)}
                onMouseOut={hideTooltip}
              />
            );
          })}
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={xScale}
          stroke={white}
          tickStroke={white}
          hideAxisLine={true}
          tickLabelProps={(value, index) => ({
            fill: black,
            fontSize: fontSize,
            textAnchor: 'middle'
          })}
        />
      </svg>
      {tooltipOpen && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{ fontSize: '10px' }}
        >
          <strong>{tooltipData.name.replace('_', ' ')}</strong>: {tooltipData.counts}
        </TooltipWithBounds>
      )}
    </div>
  );
});