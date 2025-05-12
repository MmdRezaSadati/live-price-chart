import * as d3 from 'd3';

export const calculateTransitionDuration = (currentPrice: number, previousPrice: number): number => {
  const priceChange = Math.abs(currentPrice - previousPrice);
  const percentageChange = (priceChange / previousPrice) * 100;
  
  // برای تغییرات بزرگتر، مدت زمان transition بیشتر می‌شود
  if (percentageChange > 5) return 1500; // تغییرات بزرگ
  if (percentageChange > 2) return 1000; // تغییرات متوسط
  if (percentageChange > 0.5) return 800; // تغییرات کوچک
  return 500; // تغییرات خیلی کوچک
};

interface ChartAnimationProps {
  path: d3.Selection<SVGPathElement, number[], null, undefined>;
  areaPath: d3.Selection<SVGPathElement, number[], null, undefined>;
  latestPointCircle: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  priceText: d3.Selection<SVGTextElement, unknown, null, undefined>;
  line: d3.Line<number>;
  area: d3.Area<number>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  priceData: number[];
  priceChange: "up" | "down" | null;
  colors: {
    up: { primary: string };
    down: { primary: string };
    neutral: { primary: string };
  };
  isStopped: boolean;
}

export const useChartAnimation = ({
  path,
  areaPath,
  latestPointCircle,
  priceText,
  line,
  area,
  xScale,
  yScale,
  priceData,
  priceChange,
  colors,
  isStopped
}: ChartAnimationProps) => {
  const tick = function(this: SVGPathElement) {
    const path = d3.select(this);
    const pathData = line(priceData);
    if (pathData) {
      // Update area path first
      areaPath
        .datum(priceData)
        .attr("d", area)
        .attr("fill", `url(#area-gradient-${priceChange || "up"})`);

      // Then update the line
      path
        .attr("d", pathData)
        .attr("transform", null)
        .attr("stroke", "#d7ed47")
        .attr("stroke-width", 3.5)
        .attr("filter", null);
    }

    const active = d3.active(this);
    if (active && !isStopped) {
      active
        .attr("transform", `translate(${xScale(0)},0)`)
        .transition()
        .duration(calculateTransitionDuration(priceData[priceData.length - 1], priceData[priceData.length - 2] || priceData[priceData.length - 1]))
        .ease(d3.easeCubicInOut)
        .on("start", tick);
    }

    // Update latest point position and price text
    const lastIdx = priceData.length - 1;
    latestPointCircle
      .transition()
      .duration(calculateTransitionDuration(priceData[lastIdx], priceData[lastIdx - 1] || priceData[lastIdx]))
      .ease(d3.easeCubicInOut)
      .attr("cx", xScale(lastIdx))
      .attr("cy", yScale(priceData[lastIdx]))
      .style("fill", "#fff");

  };

  return { tick };
}; 