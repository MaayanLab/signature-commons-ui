import React from 'react'
import { Bar } from '@vx/shape'
import { Group } from '@vx/group'
import { scaleBand, scaleLinear } from '@vx/scale'
import { AxisBottom } from '@vx/axis'
import Tippy from '@tippy.js/react'


// accessors
const x = (d) => d.name.replace('_', ' ')
const y = (d) => +d.counts

const black = '#000'
const white = '#fff'


export const BarChart = ({ width, height, meta_counts, fontSize, ...props }) => {
  // bounds
  const xMax = width
  const yMax = height - 120

  const margin = { top: 40 }

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: meta_counts.map(x),
    padding: 0.4,
  })
  const yScale = scaleLinear({
    rangeRound: [yMax, 0],
    domain: [0, Math.max(...meta_counts.map(y))],
  })
  console.log('meta_counts')
  console.log(meta_counts)
  return (
    <div>
      <svg width={width} height={height} style={{ display: 'block', margin: 'auto' }}>
        <rect width={width} height={height} fill={'#fff'} rx={14} />
        <Group top={40}>
          {meta_counts.map((d, i) => {
            const meta_field = x(d)
            const barWidth = xScale.bandwidth()
            const barHeight = yMax - yScale(y(d))
            const barX = xScale(meta_field)
            const barY = yMax - barHeight
            return (
              <Tippy
                key={`tip-${meta_field}`}
                content={`${x(d)} (${y(d)})`}
                arrow={true}
                theme="bootstrap"
                distance={7}
                hideOnClick={false}
                animation={'scale'}
              >
                <g>
                  <Bar
                    key={`bar-${meta_field}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill="#75bef5"
                  />
                </g>
              </Tippy>
            )
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
            textAnchor: 'middle',
          })}
        />
      </svg>
    </div>
  )
}
