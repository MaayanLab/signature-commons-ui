import React from 'react';
import { Pie } from '@vx/shape';
import { Group } from '@vx/group';
import { RadialGradient } from '@vx/gradient';
import { scaleLinear, scaleOrdinal } from '@vx/scale';
import {
  LegendOrdinal,
  LegendSize,
  LegendThreshold,
  LegendItem,
  LegendLabel
} from '@vx/legend';
import Grid from '@material-ui/core/Grid';


function LegendDemo({ title, children }) {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
    </div>
  );
}


export default ({ width, height, margin, data }) => {
  // data format {Tissue: Value}
  const white = '#ffffff';
  const black = '#000000';
  const dataLabels = data.map(function(d){
    return(
      d.label
    )
  })
  const value = d => d.value;
  const radius = Math.min(width, height) / 2;
  const centerY = height / 2;
  const centerX = width / 2;

  const sizeColorScale = scaleLinear({
    domain: [0, dataLabels.length],
    range: ['#75fcfc', '#3236b8']
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
      <Grid container spacing={24}>
        <Grid item xs={7}>
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
                        <path d={pie.path(arc)} fill={ordinalColorScale(dataLabels[i])} />
                        {hasSpaceForLabel && (
                          <text
                            fill={black}
                            x={centroidX}
                            y={centroidY}
                            dy=".33em"
                            fontSize={9}
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
        </Grid>
        <Grid item xs={5} style={{
            fontSize: '10px'
          }}>
          <LegendOrdinal scale={ordinalColorScale} direction="column" labelMargin="0 15px 0 0"/>
        </Grid>
      </Grid>
    </div>
  );
};