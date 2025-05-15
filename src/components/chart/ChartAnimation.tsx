import * as d3 from "d3";
import { createAreaGenerator, createLineGenerator } from "../../utils/chartSetup";
import styles from "@/assets/styles/LivePriceChart.module.css";

interface ChartAnimationProps {
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  latestPointCircle: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  priceHistoryRef: React.MutableRefObject<number[]>;
  getPriceQueue: () => number[];
  getPriceChangeDirection: (price: number) => "up" | "down" | "neutral";
  n: number;
}

export const initializeChartData = (
  props: ChartAnimationProps
) => {
  const { lineGroup, x, y, priceHistoryRef } = props;
  
  const lineGenerator = createLineGenerator(x, y);
  const areaGenerator = createAreaGenerator(x, y);
  
  // Update Y domain based on price history
  updateYDomain(props);
  
  // Initialize data from price history
  const data = [...priceHistoryRef.current];
  
  // Add area path
  const area = lineGroup
    .append("path")
    .datum(data)
    .attr("class", styles.area)
    .attr("fill", "url(#area-gradient-up)")
    .attr("opacity", 0.4);
  
  // Add line path
  const path = lineGroup
    .append("path")
    .datum(data)
    .attr("class", styles.line)
    .attr("fill", "none")
    .attr("stroke", "#d7ed47")
    .attr("stroke-width", 3.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round");
  
  // Set initial position of the latest point circle
  const lastIdx = data.length - 1;
  props.latestPointCircle
    .attr("cx", x(lastIdx))
    .attr("cy", y(data[lastIdx]));
  
  // Start animation
  path.transition().duration(300).ease(d3.easeLinear).on("start", function() {
    tick(this, props, data, lineGenerator, areaGenerator);
  });
  
  return { path, area, data };
};

export const updateYDomain = (props: ChartAnimationProps) => {
  const { y, priceHistoryRef } = props;
  
  const mean =
    priceHistoryRef.current.reduce((a, b) => a + b, 0) /
    priceHistoryRef.current.length;
  let min = mean * 0.9999;
  let max = mean * 1.0001;
  const realMin = Math.min(...priceHistoryRef.current);
  const realMax = Math.max(...priceHistoryRef.current);
  if (realMin < min) min = realMin;
  if (realMax > max) max = realMax;
  y.domain([min, max]);
  return { mean, min, max };
};

function tick(
  pathElement: SVGPathElement,
  props: ChartAnimationProps,
  data: number[],
  lineGenerator: d3.Line<number>,
  areaGenerator: d3.Area<number>
) {
  const { lineGroup, latestPointCircle, x, y, priceHistoryRef, getPriceQueue, getPriceChangeDirection, n } = props;
  
  const now = Date.now();
  let newData: number;
  let lastUpdate = 0;

  if (getPriceQueue().length > 0 && now - lastUpdate >= 300) {
    const price = getPriceQueue().shift()!;
    priceHistoryRef.current.push(price);
    if (priceHistoryRef.current.length > n) priceHistoryRef.current.shift();
    updateYDomain(props);
    newData = price;
  } else {
    newData = data[data.length - 1];
  }

  data.push(newData);
  if (data.length > n) data.shift();

  // Update line path
  d3.select(pathElement).attr("d", lineGenerator(data)).attr("transform", null);

  // Update area path with the same animation as the line path
  const parentNode = d3.select(pathElement.parentNode as Element);
  const areaPath = parentNode.select(`.${styles.area}`);
  const priceChangeDirection = getPriceChangeDirection(newData);

  areaPath
    .attr("d", areaGenerator(data))
    .attr("transform", null)
    .attr("fill", `url(#area-gradient-${priceChangeDirection})`);

  // Continue animation
  const active = d3.active(pathElement);
  if (active) {
    const transform = `translate(${x(0)},0)`;
    active.attr("transform", transform).transition().on("start", function() {
      tick(this, props, data, lineGenerator, areaGenerator);
    });

    // Apply the same transform to area path with the same transition
    areaPath
      .attr("transform", `translate(${x(0) + 10},0)`)
      .transition()
      .duration(300)
      .ease(d3.easeLinear);
  }

  data.shift();

  // Update circle position
  const lastIdx = data.length - 1;
  const lastX = x(lastIdx);
  const lastY = y(data[lastIdx]);

  latestPointCircle
    .transition()
    .duration(50)
    .ease(d3.easeLinear)
    .attr("cx", lastX + 12)
    .attr("cy", lastY);
}

export const fetchInitialChartData = async (
  n: number,
  priceHistoryRef: React.MutableRefObject<number[]>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  initChart: () => void
) => {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=${n}`
    );
    const klines = await response.json();
    priceHistoryRef.current = klines.map((d: any[]) => +d[4]);
    setLoading(false);
    initChart();
  } catch (err) {
    setError("Error fetching initial data!");
    setLoading(false);
  }
};