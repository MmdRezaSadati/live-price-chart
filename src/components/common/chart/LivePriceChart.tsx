"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useWebSocket } from "@/hooks/useWebSocket";
import { LivePriceChartProps } from "@/types/chart";
import { BITCOIN_SYMBOL, MAX_DATA_POINTS } from "@/constants/chart";

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

  useEffect(() => {
    if (!svgRef.current || isLoading || priceData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    svg.selectAll("*").remove();

    // Calculate y domain with padding
    const min = d3.min(priceData) ?? 0;
    const max = d3.max(priceData) ?? 0;
    const padding = (max - min) * 0.15 || 1;
    const yDomainMin = min - padding;
    const yDomainMax = max + padding;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, MAX_DATA_POINTS - 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([yDomainMin, yDomainMax])
      .range([innerHeight, 0]);

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

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    // Create line group with clip path
    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    // Add shadow filter
    const defs = svg.append("defs");

    // Enhanced glow filter with multiple layers
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    // Primary glow
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "6")
      .attr("result", "coloredBlur");

    // Secondary glow for extra depth
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur2");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "coloredBlur2");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add gradient definitions with multiple color stops
    const createGradient = (id: string, color: string) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      // Multiple gradient stops for more depth and visual interest
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.6);

      gradient
        .append("stop")
        .attr("offset", "30%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.4);

      gradient
        .append("stop")
        .attr("offset", "70%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.2);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0);
    };

    // Modern color palette with vibrant colors
    const colors = {
      up: {
        primary: "#10b981",
        secondary: "#059669",
        gradient: "#34d399",
        glow: "#6ee7b7",
      },
      down: {
        primary: "#f43f5e",
        secondary: "#e11d48",
        gradient: "#fb7185",
        glow: "#fda4af",
      },
      neutral: {
        primary: "#3b82f6",
        secondary: "#2563eb",
        gradient: "#60a5fa",
        glow: "#93c5fd",
      },
    };

    createGradient("area-gradient-up", colors.up.gradient);
    createGradient("area-gradient-down", colors.down.gradient);

    // Add area path first (so it appears behind the line)
    const areaPath = lineGroup
      .append("path")
      .datum(priceData)
      .attr("class", "area")
      .attr("fill", `url(#area-gradient-${priceChange || "up"})`)
      .attr("d", area);

    // تابع محاسبه مدت زمان transition بر اساس میزان تغییر
    const calculateTransitionDuration = (currentPrice: number, previousPrice: number) => {
      const priceChange = Math.abs(currentPrice - previousPrice);
      const percentageChange = (priceChange / previousPrice) * 100;
      
      // برای تغییرات بزرگتر، مدت زمان transition بیشتر می‌شود
      if (percentageChange > 5) return 1500; // تغییرات بزرگ
      if (percentageChange > 2) return 1000; // تغییرات متوسط
      if (percentageChange > 0.5) return 800; // تغییرات کوچک
      return 500; // تغییرات خیلی کوچک
    };

    // Add main line without shadow or glow
    const path = lineGroup
      .append("path")
      .datum(priceData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#d7ed47")
      .attr("stroke-width", 3.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line)
      .transition()
      .duration(calculateTransitionDuration(priceData[priceData.length - 1], priceData[priceData.length - 2] || priceData[priceData.length - 1]))
      .ease(d3.easeCubicInOut) // تغییر به easeCubicInOut برای حرکت نرم‌تر
      .on("start", tick);

    // Add latest point circle with enhanced styling
    const latestPointCircle = g
      .append("circle")
      .attr("r", 7)
      .style("fill", "#fff")
      .style("stroke", "white")
      .style("stroke-width", "3.5px");
    // .style("filter", "url(#glow)");

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
    priceText.text(`$${priceData[lastIdx].toFixed(2)}`);

    function tick(this: SVGPathElement) {
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

      priceText
        .text(`$${priceData[lastIdx].toFixed(2)}`)
        .style(
          "fill",
          priceChange === "up"
            ? colors.up.primary
            : priceChange === "down"
              ? colors.down.primary
              : colors.neutral.primary
        );
    }
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
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};
