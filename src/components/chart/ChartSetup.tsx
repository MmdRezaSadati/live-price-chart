import * as d3 from "d3";
import { ChartDimensions } from "../../utils/chartSetup";
import styles from "@/assets/styles/LivePriceChart.module.css";

interface ChartSetupProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  dimensions: ChartDimensions;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
}

export const setupChartElements = ({
  svg,
  dimensions,
  x,
  y,
}: ChartSetupProps) => {
  const { width, height, margin } = dimensions;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add grid
  g.append("g")
    .attr("class", styles.grid)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => "")
    );

  g.append("g")
    .attr("class", styles.grid)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(-height)
        .tickFormat(() => "")
    );

  // Add axes
  g.append("g").attr("class", styles.axis).call(d3.axisLeft(y));

  g.append("g")
    .attr("class", styles.axis)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width + margin.right)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

  const latestPointCircle = g
    .append("circle")
    .attr("r", 7)
    .style("fill", "#fff")
    .style("stroke", "white")
    .style("stroke-width", "3.5px");

  return { g, lineGroup, latestPointCircle };
};

export const setupTooltipHandlers = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  dimensions: ChartDimensions,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  data: number[],
  setTooltip: (tooltip: { x: number; y: number; value: number } | null) => void
) => {
  const { margin } = dimensions;

  svg.on("mousemove", function (event) {
    const [mx] = d3.pointer(event);
    const idx = Math.round((mx - margin.left) / (dimensions.width / (data.length - 1)));
    if (idx >= 0 && idx < data.length) {
      setTooltip({
        x: x(idx) + margin.left,
        y: y(data[idx]) + margin.top,
        value: data[idx],
      });
    } else {
      setTooltip(null);
    }
  });
  
  svg.on("mouseleave", function () {
    setTooltip(null);
  });
};