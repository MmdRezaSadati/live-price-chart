"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useWebSocket } from "@/hooks/useWebSocket";
import { LivePriceChartProps } from "@/types/chart";
import { BITCOIN_SYMBOL } from "@/constants/chart";
import { useChartScales } from "./hooks/useChartScales";
import { useChartGenerators } from "./hooks/useChartGenerators";
import { useChartColors } from "./hooks/useChartColors";
import { useChartAnimation, calculateTransitionDuration } from "./hooks/useChartAnimation";
import { ChartAxes } from "./components/ChartAxes";
import { ChartFilters } from "./components/ChartFilters";
import styles from './LivePriceChart.module.css';

export const LivePriceChart = ({
  width = 800,
  height = 400,
}: LivePriceChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isStopped, setIsStopped] = useState(false);
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);
  const { priceData, isLoading, lastPrice, stopWebSocket } = useWebSocket(
    () => {}
  );
  const [tooltip, setTooltip] = useState<{x: number, y: number, value: number} | null>(null);

  useEffect(() => {
    if (!svgRef.current || isLoading || priceData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // Clear previous content
    svg.selectAll("*").remove();

    // Get chart scales
    const { xScale, yScale, innerWidth, innerHeight } = useChartScales(
      width,
      height,
      priceData
    );

    // Get chart generators
    const { line, area } = useChartGenerators(xScale, yScale);

    // Get chart colors
    const { colors } = useChartColors();

    // Create group for chart
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add clip path
    g.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    // Add chart axes
    ChartAxes({ g, xScale, yScale, innerHeight });

    // Add chart filters and gradients
    ChartFilters({ svg });

    // Create line group with clip path
    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    // Add area path first (so it appears behind the line)
    const areaPath = lineGroup
      .append("path")
      .datum<number[]>(priceData)
      .attr("class", "area")
      .attr("fill", `url(#area-gradient-${priceChange || "up"})`)
      .attr("d", area);

    // Create path for animation
    const path = lineGroup
      .append("path")
      .datum<number[]>(priceData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#d7ed47")
      .attr("stroke-width", 3.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    // Get chart animation
    const { tick } = useChartAnimation({
      path,
      areaPath,
      latestPointCircle: g.append("circle"),
      priceText: g.append("text"),
      line,
      area,
      xScale,
      yScale,
      priceData,
      priceChange,
      colors,
      isStopped
    });

    // Add transition to path
    path
      .transition()
      .duration(calculateTransitionDuration(priceData[priceData.length - 1], priceData[priceData.length - 2] || priceData[priceData.length - 1]))
      .ease(d3.easeCubicInOut)
      .on("start", tick);

    // Add latest point circle with enhanced styling
    const latestPointCircle = g
      .append("circle")
      .attr("r", 7)
      .style("fill", "#fff")
      .style("stroke", "white")
      .style("stroke-width", "3.5px");

    // Add current price text with enhanced styling
    const priceText = g
      .append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .style("font-size", "20px")
      .style("font-weight", "800")
      .style(
        "fill",
        priceChange === "up"
          ? colors.up.primary
          : priceChange === "down"
            ? colors.down.primary
            : colors.neutral.primary
      )
      .style("filter", "url(#glow)")
      .style("text-shadow", "0 0 15px rgba(0,0,0,0.3)");

    // Initial position of latest point and price text
    const lastIdx = priceData.length - 1;
    latestPointCircle
      .attr("cx", xScale(lastIdx))
      .attr("cy", yScale(priceData[lastIdx]));
    // priceText.text(`$${priceData[lastIdx].toFixed(2)}`);

    // Tooltip logic
    svg.on('mousemove', function(event) {
      const [mx] = d3.pointer(event);
      const idx = Math.round((mx - margin.left) / (innerWidth / (priceData.length - 1)));
      if (idx >= 0 && idx < priceData.length) {
        setTooltip({
          x: xScale(idx) + margin.left,
          y: yScale(priceData[idx]) + margin.top,
          value: priceData[idx]
        });
      } else {
        setTooltip(null);
      }
    });
    svg.on('mouseleave', function() {
      setTooltip(null);
    });

  }, [priceData, lastPrice, width, height, isLoading, isStopped, priceChange]);

  // Update price change direction when new data arrives
  useEffect(() => {
    if (priceData.length >= 2) {
      const currentPrice = priceData[priceData.length - 1];
      const previousPrice = priceData[priceData.length - 2];
      setPriceChange(
        currentPrice > previousPrice
          ? "up"
          : currentPrice < previousPrice
            ? "down"
            : null
      );
    }
  }, [priceData]);

  const handleStop = () => {
    setIsStopped(true);
    stopWebSocket();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={styles.chartWrapper + ' relative'}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      {/* Animated Price Box */}
      <div className={styles.priceBox + ' ' + (priceChange === 'up' ? styles.up : priceChange === 'down' ? styles.down : styles.neutral)}>
        ${lastPrice?.toLocaleString(undefined, {maximumFractionDigits: 2})}
      </div>
      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          ${tooltip.value.toLocaleString(undefined, {maximumFractionDigits: 2})}
        </div>
      )}
    </div>
  );
};
