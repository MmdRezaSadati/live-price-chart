import * as d3 from 'd3';

interface ChartGenerators {
  line: d3.Line<number>;
  area: d3.Area<number>;
}

export const useChartGenerators = (
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): ChartGenerators => {
  // Create line generator
  const line = d3
    .line<number>()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveCatmullRom.alpha(0.7));

  // Create area generator with fixed baseline at the bottom of the chart
  const area = d3
    .area<number>()
    .x((_, i) => xScale(i))
    .y0(() => yScale.range()[0])
    .y1((d) => yScale(d))
    .curve(d3.curveCatmullRom.alpha(0.7));

  return {
    line,
    area
  };
}; 