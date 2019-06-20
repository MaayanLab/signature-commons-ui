import React from 'react'
import { Pie } from '@vx/shape'
import { Group } from '@vx/group'
import { scaleLinear, scaleOrdinal } from '@vx/scale'
import { withScreenSize } from '@vx/responsive'
import Tippy from '@tippy.js/react'


const colorrange = {
  'Green': ['#afdbaf', '#136313'],
  'Purple': ['#d390e1', '#720b87'],
  'Blue': ['#75bef5', '#0367b4'],
  'Gray': ['#717171', '#fefefe'],
}

const handleClick = (e, label, resources, disabled) => {
  if (disabled === undefined) {
    if (resources) {
      location.href = `#/Resources/${label}`
    } else {
      location.href = `#/MetadataSearch?q=${label}`
    }
  }
}

const black = '#000000'
export const DonutChart = withScreenSize(function({ ...props }) {
  // data format {Tissue: Value}
  const {
    width,
    height,
    margin,
    data,
    radius,
    fontSize,
    resources,
    disabled,
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
                const angle = startAngle + (endAngle - startAngle) / 2
                return (
                  <Tippy
                    key={`tip-${arc.data.label}-${i}`}
                    content={`${data[i].label} (${data[i].value})`}
                    arrow={true}
                    theme="bootstrap"
                    distance={7}
                    hideOnClick={false}
                    followCursor={'initial'}
                    animation={'scale'}
                  >
                    <g key={`browser-${arc.data.label}-${i}`}>
                      <path d={pie.path(arc)}
                        fill={ordinalColorScale(dataLabels[i])}
                        onClick={(e) => handleClick(e, arc.data.label, resources, disabled)}
                      />
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
                  </Tippy>
                )
              })
            }}
          </Pie>
        </Group>
      </svg>
    </div>
  )
})
