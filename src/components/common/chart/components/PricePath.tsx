"use client";

import { COLORS } from "@/constants/chart";
import { animated, useSpring } from "@react-spring/web";
import * as d3 from "d3";
import { useMemo } from "react";
import { PricePathProps } from "../../../../types/chart";
import { TimeAxis } from "./TimeAxis";

import { PricePathArea } from "./PricePathArea";

import { useChartPathCalculation } from "@/hooks/useChartPathCalculation";
import { PricePathAnimation } from "./path/PricePathAnimation";
import { PricePathIndicator } from "./path/PricePathIndicator";
import { ChartGrid } from "./ChartGrid";

export const PricePath = ({
  priceData,
  timeScale,
  priceScale,
  width,
  height,
  headerHeight,
  padding,
  glowColor,
  strokeWidth = 3,
  circleRadius = 6,
  fontSize,
  lineDrawProgress = 1.0,
  priceChange = 0,
  darkMode = true,
  isAnimatingNewSegment = false,
  lastTwoPoints,
  newSegmentProgress = 0,
  delayedPathData = [],
  delayedPathProgress = 0,
  isAnimatingDelayedPath = false,
}: PricePathProps) => {
  // Calculate chart area height (excluding header)
  const chartHeight = height - headerHeight;
  // Reserve extra space at the bottom for the time axis
  const timeAxisHeight = 30;

  const color = priceChange >= 0 ? COLORS.up : COLORS.down;
  const fillColor = priceChange >= 0 ? COLORS.upGlow : COLORS.downGlow;

  // Calculate all path data using the hook with enhanced smoothing
  const { areaPath, spring } = useChartPathCalculation({
    priceData,
    timeScale,
    priceScale,
    chartHeight,
    padding,
    timeAxisHeight,
    isAnimatingNewSegment,
    lastTwoPoints,
    newSegmentProgress,
    delayedPathData,
    delayedPathProgress,
    curve: d3.curveCatmullRom.alpha(0.5),
    interpolationPoints: 100,
  });

  return (
    <svg
      width={width}
      height={chartHeight}
      style={{ marginTop: `${headerHeight}px` }}
      className="chart-svg"
    >
      {/* Grid lines with values */}
      <ChartGrid
        priceData={priceData}
        priceScale={priceScale}
        width={width}
        padding={padding}
        fontSize={fontSize}
        chartHeight={chartHeight}
      />

      {/* Time axis line */}
      <line
        x1={padding.x}
        y1={chartHeight - padding.y * 2 - timeAxisHeight}
        x2={width}
        y2={chartHeight - padding.y * 2 - timeAxisHeight}
        stroke={COLORS.grid}
        strokeWidth={1}
      />

      {/* Chart content with animation */}
      <g>
        <PricePathArea areaPath={spring.areaPath} fillColor={fillColor} />
        <animated.path
          d={spring.linePath.get()}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <PricePathAnimation
          animatedSegmentPath={spring.linePath}
          delayedPath={spring.linePath.get()}
          color={color}
          glowColor={glowColor}
          strokeWidth={strokeWidth}
          isAnimatingNewSegment={isAnimatingNewSegment}
          isAnimatingDelayedPath={isAnimatingDelayedPath}
        />

        <PricePathIndicator
          x={spring.x}
          y={spring.y}
          radius={circleRadius}
          color={color}
          glowColor={glowColor}
          strokeWidth={strokeWidth}
          darkMode={darkMode}
          isAnimatingNewSegment={isAnimatingNewSegment}
        />

        {/* Time axis at the bottom of the chart */}
        <TimeAxis
          timeScale={timeScale}
          width={width}
          height={chartHeight}
          padding={{
            x: padding.x,
            y: padding.y + timeAxisHeight / 2,
          }}
          priceData={priceData}
          fontSize={fontSize}
        />
      </g>
    </svg>
  );
};
