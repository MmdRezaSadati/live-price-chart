import * as d3 from "d3";

export interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export const createChartScales = (dimensions: ChartDimensions, n: number) => {
  const { width, height } = dimensions;
  
  const x = d3
    .scaleLinear()
    .domain([1, n - 2])
    .range([0, width]);

  const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

  return { x, y };
};

export const createLineGenerator = (x: d3.ScaleLinear<number, number>, y: d3.ScaleLinear<number, number>) => {
  return d3
    .line<number>()
    .curve(d3.curveCatmullRom)
    .x((_, i) => x(i))
    .y((d) => y(d));
};

export const createAreaGenerator = (x: d3.ScaleLinear<number, number>, y: d3.ScaleLinear<number, number>) => {
  return d3
    .area<number>()
    .curve(d3.curveCatmullRom)
    .x((_, i) => x(i))
    .y0(() => y.range()[0])
    .y1((d) => y(d));
};

export const createGradients = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
  const defs = svg.append("defs");
  
  // Add glow filter
  defs.append("filter")
    .attr("id", "glow")
    .append("feGaussianBlur")
    .attr("stdDeviation", "2.5")
    .attr("result", "coloredBlur");

  // Add gradients
  ["up", "down", "neutral"].forEach((type) => {
    const gradient = defs
      .append("linearGradient")
      .attr("id", `area-gradient-${type}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    // Top color - more intense
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", type === "up" ? "#4CAF50" : type === "down" ? "#F44336" : "#9E9E9E")
      .attr("stop-opacity", 0.6);

    // Middle color - medium intensity
    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", type === "up" ? "#4CAF50" : type === "down" ? "#F44336" : "#9E9E9E")
      .attr("stop-opacity", 0.3);

    // Bottom color - fade out
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", type === "up" ? "#4CAF50" : type === "down" ? "#F44336" : "#9E9E9E")
      .attr("stop-opacity", 0);
  });
}; 