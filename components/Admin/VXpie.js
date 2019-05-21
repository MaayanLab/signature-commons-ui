import React from 'react'
import { Pie } from '@vx/shape'
import { Group } from '@vx/group'
import { scaleLinear, scaleOrdinal } from '@vx/scale'
import { withTooltip, TooltipWithBounds } from '@vx/tooltip'
import { withScreenSize } from '@vx/responsive'
import { localPoint } from '@vx/event'


const colorrange = {
  'Green': ['#afdbaf', '#136313'],
  'Purple': ['#d390e1', '#720b87'],
  'Blue': ['#75bef5', '#0367b4'],
  'Gray': ['#717171', '#fefefe'],
}

const handleMouseOver = (event, datum, props) => {
  const coords = localPoint(event.target.ownerSVGElement, event)
  props.showTooltip({
    tooltipLeft: coords.x,
    tooltipTop: coords.y,
    tooltipData: datum,
  })
}

const black = '#000000'
export const DonutChart = withScreenSize(withTooltip(function({ ...props }) {
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
    fontSize,
    true_values,
  } = props

  const dataLabels = data.map(function(d) {
    return (
      d.label
    )
  })
  const value = (d) => d.value
  const centerY = (height) / 2
  const centerX = (width) / 2


  const sizeColorScale = scaleLinear({
    domain: [0, dataLabels.length],
    range: colorrange[props.color],
  })

  const ordinalColorScale = scaleOrdinal({
    domain: dataLabels,
    range: dataLabels.map(function(b, i) {
      return (
        sizeColorScale(i)
      )
    }),
  })


  return (
    <div>
      <svg width={width} height={height} style={{ background: '#FFF' }}>
        <Group top={centerY - margin.top} left={centerX}>
          <Pie
            data={data}
            pieValue={value}
            outerRadius={radius - 80}
            innerRadius={radius - 120}
            cornerRadius={3}
            padAngle={0}
          >
            {(pie) => {
              return pie.arcs.map((arc, i) => {
                const [centroidX, centroidY] = pie.path.centroid(arc)
                const { startAngle, endAngle } = arc
                const hasSpaceForLabel = endAngle - startAngle >= 0.35
                const angle = startAngle + (endAngle - startAngle)/2
                return (
                  <g key={`browser-${arc.data.label}-${i}`}>
                    <path d={pie.path(arc)}
                      fill={ordinalColorScale(dataLabels[i])}
                      onMouseMove={(e) => handleMouseOver(e, true_values[i], props)}
                      onMouseOut={hideTooltip}/>
                    {hasSpaceForLabel && (
                      <text
                        fill={black}
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize={fontSize}
                        textAnchor="middle"
                        angle={angle}
                      >
                        {arc.data.label}
                      </text>
                    )}
                  </g>
                )
              })
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
          style={{ fontSize: '10px' }}
        >
          <strong>{tooltipData.label}</strong>: {tooltipData.value}
        </TooltipWithBounds>
      )}
    </div>
  )
}))
