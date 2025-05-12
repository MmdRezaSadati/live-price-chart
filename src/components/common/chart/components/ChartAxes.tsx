import * as d3 from 'd3';
import React from 'react';

interface ChartAxesProps {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  innerHeight: number;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({
  g,
  xScale,
  yScale,
  innerHeight
}) => {
  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));

  g.append("g").call(d3.axisLeft(yScale));

  return null;
}; 