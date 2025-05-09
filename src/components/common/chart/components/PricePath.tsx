"use client";

import React, { useState, useEffect } from "react";
import { PricePathProps } from "../../../../types/chart";
import { COLORS } from "@/constants/chart";
import { TimeAxis } from "./TimeAxis";
import { usePathCalculation } from "./hooks/usePathCalculation";
import { PricePathLine } from "./PricePathLine";
import { PricePathArea } from "./PricePathArea";
import { PricePathAnimation } from "./PricePathAnimation";
import { PricePathIndicator } from "./PricePathIndicator";

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

  // State for circle position
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });

  // Calculate all path data using the hook
  const { linePath, delayedPath, animatedSegmentPath, areaPath } = usePathCalculation({
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
  });

  // Update circle position
  useEffect(() => {
    if (!timeScale || !priceScale || !priceData.length) return;

    let animationFrameId: number;

    const updatePosition = () => {
      if (isAnimatingNewSegment && lastTwoPoints?.prev && lastTwoPoints?.current) {
        const { prev: prevPoint, current: currentPoint } = lastTwoPoints;
        const startX = timeScale(prevPoint.timestamp);
        const startY = priceScale(prevPoint.price);
        const endX = timeScale(currentPoint.timestamp);
        const endY = priceScale(currentPoint.price);

        setCirclePosition({
          x: startX + (endX - startX) * newSegmentProgress,
          y: startY + (endY - startY) * newSegmentProgress,
        });
      } else if (priceData.length > 0) {
        const lastPoint = priceData[priceData.length - 1];
        setCirclePosition({
          x: timeScale(lastPoint.timestamp),
          y: priceScale(lastPoint.price),
        });
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [timeScale, priceScale, priceData, isAnimatingNewSegment, lastTwoPoints, newSegmentProgress]);

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
        <PricePathArea areaPath={areaPath} fillColor={fillColor} />
        
        <PricePathLine
          linePath={linePath}
          color={color}
          glowColor={glowColor}
          strokeWidth={strokeWidth}
          priceChange={priceChange}
        />

        <PricePathAnimation
          animatedSegmentPath={animatedSegmentPath}
          delayedPath={delayedPath}
          color={color}
          glowColor={glowColor}
          strokeWidth={strokeWidth}
          isAnimatingNewSegment={isAnimatingNewSegment}
          isAnimatingDelayedPath={isAnimatingDelayedPath}
        />

        <PricePathIndicator
          x={circlePosition.x}
          y={circlePosition.y}
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
