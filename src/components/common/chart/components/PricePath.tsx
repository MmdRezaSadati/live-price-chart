"use client";

import React from "react";
import { PricePathProps } from "../../../../types/chart";
import { COLORS } from "@/constants/chart";
import { useEffect, useRef, useState, useMemo } from "react";
import { TimeAxis } from "./TimeAxis";
import { useSpring, animated } from "react-spring";

/**
 * Chart grid and price path component
 * Displays the grid lines, price path, and animations
 */
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
}: PricePathProps) => {
  // Local reference to path element for animation
  const pathRef = useRef<SVGPathElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const [pathLength, setPathLength] = useState(0);

  // State for circle position
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });

  // Calculate chart area height (excluding header)
  const chartHeight = height - headerHeight;

  // Reserve extra space at the bottom for the time axis
  const timeAxisHeight = 30; // Height reserved for time axis

  const color = priceChange >= 0 ? COLORS.up : COLORS.down;
  const fillColor = priceChange >= 0 ? COLORS.upGlow : COLORS.downGlow;

  // Calculate line path string based on price data
  const linePath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale) return "";

    // Only include points that should be visible based on lineDrawProgress
    const visiblePoints = priceData.slice(
      0,
      Math.max(2, Math.ceil(priceData.length * lineDrawProgress))
    );

    // Generate path data
    let d = "";
    visiblePoints.forEach((point, i) => {
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);

      if (i === 0) {
        d += `M ${x},${y}`;
      } else {
        d += ` L ${x},${y}`;
      }
    });

    return d;
  }, [priceData, timeScale, priceScale, lineDrawProgress]);

  // Area path for fill
  const areaPath = useMemo(() => {
    if (!linePath) return "";

    // Close the path to create an area below the line
    // Use the adjusted position for the bottom of the area to align with time axis
    const bottomY = chartHeight - padding.y * 2 - timeAxisHeight;
    return `${linePath} L ${width},${bottomY} L ${padding.x},${bottomY} Z`;
  }, [linePath, width, chartHeight, padding, timeAxisHeight]);
  useEffect(() => {
    if (pathRef.current && linePath) {
      try {
        setPathLength(pathRef.current.getTotalLength());
      } catch (e) {}
    }
  }, [linePath]);

  const spring = useSpring({
    from: { dash: pathLength },
    to: { dash: 0 },
    config: { duration: 1000 },
    reset: linePath !== "",
  });

  // Calculate path length and position circle directly on the path
  useEffect(() => {
    if (!pathRef.current || !linePath) return;

    try {
      // Get total path length
      const totalLength = pathRef.current.getTotalLength();

      // Set up path animation
      pathRef.current.style.strokeDasharray = `${totalLength}`;
      pathRef.current.style.strokeDashoffset = `${
        totalLength * (1 - lineDrawProgress)
      }`;

      // Calculate position for circle - reduce offset to move it forward
      const visibleLength = totalLength * lineDrawProgress;
      const circleOffset = 5; // Reduced from 15 to 5 to move the circle forward
      const pointPosition = visibleLength - circleOffset;

      // Ensure we don't try to get a point before the start of the path
      const finalPosition = Math.max(0, pointPosition);

      // Get the point on the path at the calculated position
      const point = pathRef.current.getPointAtLength(finalPosition);
      setCirclePosition({ x: point.x, y: point.y });
    } catch (error) {
      // Only log error if we're not in a test environment
      if (process.env.NODE_ENV !== "test") {
        console.error("Error calculating path points:", error);
      }
    }
  }, [linePath, lineDrawProgress]);

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
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.05" />
          </linearGradient>

          {/* Clip path for area animation */}
          <clipPath id="chartClip">
            <path d={linePath} />
          </clipPath>
        </defs>

        {/* Area fill below the line with gradient */}
        <path
          data-testid="area-path"
          d={areaPath}
          fill="url(#areaGradient)"
          opacity={0.5}
          clipPath="url(#chartClip)"
          className="transition-colors duration-300 ease-out"
        />

        {/* Price path with animation and glow */}
        <animated.path
          data-testid="price-path"
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{
            filter: `drop-shadow(0 0 3px ${glowColor})`,
            strokeDasharray: pathLength,
            strokeDashoffset: spring.dash,
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300 ease-out"
        />

        {/* Circle indicator on path - positioned using getPointAtLength to ensure alignment */}
        <circle
          data-testid="indicator-circle"
          ref={circleRef}
          cx={circlePosition.x}
          cy={circlePosition.y}
          r={circleRadius}
          fill={"#fff"}
          stroke={darkMode ? COLORS.background : "#fff"}
          strokeWidth={strokeWidth * 0.7}
          className="transition-colors duration-300 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
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
