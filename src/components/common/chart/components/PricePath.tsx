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

  // Calculate circle position directly from the last data point using useMemo
  const circlePosition = useMemo(() => {
    if (!priceData.length || !timeScale || !priceScale) {
      return { x: 0, y: 0 };
    }
    const lastPoint = priceData[priceData.length - 1];
    return {
      x: timeScale(lastPoint.timestamp),
      y: priceScale(lastPoint.price),
    };
  }, [priceData, timeScale, priceScale]);

  // Calculate all path data using the hook with enhanced smoothing
  const { linePath, delayedPath, animatedSegmentPath, areaPath } =
    useChartPathCalculation({
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

  // Create spring animations for paths
  const spring = useSpring({
    from: {
      areaPath,
      linePath,
      x: circlePosition?.x || 0,
      y: circlePosition?.y || 0,
    },
    to: {
      areaPath,
      linePath,
      x: circlePosition?.x || 0,
      y: circlePosition?.y || 0,
    },
    config: {
      tension: 750,
      friction: 150,
    },
  });

  // Grid rendering function
  const renderGrid = () => {
    const gridLines = [];

    // Horizontal grid lines (price levels)
    for (let i = 0; i <= 5; i++) {
      const price =
        priceData.length > 0
          ? priceData[priceData.length - 1].price -
            priceData[priceData.length - 1].price * 0.002 +
            (i * (priceData[priceData.length - 1].price * 0.004)) / 4
          : 0;

      const y = priceScale(price);
      gridLines.push(
        <g key={`grid-${i}`} className="transition-all duration-700">
          <line
            data-testid="grid-line"
            x1={padding.x}
            y1={y}
            x2={width}
            y2={y}
            stroke={COLORS.grid}
            strokeDasharray="3,5"
            strokeWidth={1}
          />
          <text
            x={padding.x / 2}
            y={y - 6}
            fill={COLORS.gridText}
            fontSize={fontSize.labels}
            className="font-mono"
          >
            ${Math.round(price).toLocaleString()}
          </text>
        </g>
      );
    }

    // Vertical grid lines (time periods)
    for (let i = 0; i <= 4; i++) {
      const x = padding.x + (i / 4) * (width - padding.x * 2);
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding.y}
          x2={x}
          y2={chartHeight - padding.y * 3}
          stroke={COLORS.grid}
          strokeWidth="1"
        />
      );
    }

    return gridLines;
  };

  return (
    <svg
      width={width}
      height={chartHeight}
      style={{ marginTop: `${headerHeight}px` }}
      className="chart-svg"
    >
      {/* Grid lines with values */}
      {renderGrid()}

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
          d={spring.linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <PricePathAnimation
          animatedSegmentPath={spring.linePath}
          delayedPath={delayedPath}
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
