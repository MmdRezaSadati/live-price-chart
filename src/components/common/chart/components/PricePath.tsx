"use client";

import React from "react";
import { PricePathProps } from "../../../../types/chart";
import { COLORS } from "@/constants/chart";
import { useEffect, useRef, useState, useMemo } from "react";
import { TimeAxis } from "./TimeAxis";

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
  isAnimatingNewSegment = false,
  lastTwoPoints,
  newSegmentProgress = 0,
  delayedPathData = [],
  delayedPathProgress = 0,
  isAnimatingDelayedPath = false,
}: PricePathProps) => {
  // Local reference to path element for animation
  const pathRef = useRef<SVGPathElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const delayedPathRef = useRef<SVGPathElement | null>(null);

  // State for circle position
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });

  // Calculate chart area height (excluding header)
  const chartHeight = height - headerHeight;

  // Reserve extra space at the bottom for the time axis
  const timeAxisHeight = 30; // Height reserved for time axis

  const color = priceChange >= 0 ? COLORS.up : COLORS.down;
  const fillColor = priceChange >= 0 ? COLORS.upGlow : COLORS.downGlow;

  // Calculate line path string based on price data - showing complete path
  const linePath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale) return "";

    // Generate path data for all points except the newest
    let d = "";

    // Use all data points
    priceData.forEach((point, i) => {
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);

      if (i === 0) {
        d += `M ${x},${y}`;
      } else {
        d += ` L ${x},${y}`;
      }
    });

    return d;
  }, [priceData, timeScale, priceScale]);

  // Calculate delayed path string
  const delayedPath = useMemo(() => {
    if (
      !delayedPathData ||
      !timeScale ||
      !priceScale ||
      delayedPathData.length < 2
    )
      return "";

    let d = "";

    // Calculate how many points to show based on progress
    const totalPoints = delayedPathData.length;
    const visiblePoints = Math.max(
      2,
      Math.ceil(totalPoints * delayedPathProgress)
    );

    // Generate path data for visible points
    delayedPathData.slice(0, visiblePoints).forEach((point, i) => {
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);

      if (i === 0) {
        d += `M ${x},${y}`;
      } else {
        d += ` L ${x},${y}`;
      }
    });

    return d;
  }, [delayedPathData, timeScale, priceScale, delayedPathProgress]);

  // Calculate the animated new segment if we have one
  const animatedSegmentPath = useMemo(() => {
    // If not animating or missing data, return empty
    if (
      !isAnimatingNewSegment ||
      !lastTwoPoints?.prev ||
      !lastTwoPoints?.current ||
      !timeScale ||
      !priceScale
    ) {
      return "";
    }

    // Get the coordinates for the last two points
    const prevPoint = lastTwoPoints.prev;
    const currentPoint = lastTwoPoints.current;

    // Calculate coordinates
    const startX = timeScale(prevPoint.timestamp);
    const startY = priceScale(prevPoint.price);
    const endX = timeScale(currentPoint.timestamp);
    const endY = priceScale(currentPoint.price);

    // Calculate the interpolated position based on animation progress
    const currentX = startX + (endX - startX) * newSegmentProgress;
    const currentY = startY + (endY - startY) * newSegmentProgress;

    // Create the segment path
    return `M ${startX},${startY} L ${currentX},${currentY}`;
  }, [
    isAnimatingNewSegment,
    lastTwoPoints,
    timeScale,
    priceScale,
    newSegmentProgress,
  ]);

  // Calculate area path for the filled gradient area under the curve
  const areaPath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale) return "";
    if (priceData.length < 2) return "";

    // Area path starts from the bottom-left, follows the line, and returns to bottom-right
    let d = "";
    const chartBottom = chartHeight - padding.y * 2 - timeAxisHeight;

    // Start at the bottom left
    const firstPoint = priceData[0];
    const firstX = timeScale(firstPoint.timestamp);
    d += `M ${firstX},${chartBottom}`;

    // Move up to the first point
    d += ` L ${firstX},${priceScale(firstPoint.price)}`;

    // Follow the line path for all points
    for (let i = 1; i < priceData.length; i++) {
      const point = priceData[i];
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);
      d += ` L ${x},${y}`;
    }

    // If we're animating a new segment, add the partial segment
    if (
      isAnimatingNewSegment &&
      lastTwoPoints?.prev &&
      lastTwoPoints?.current
    ) {
      const prevPoint = lastTwoPoints.prev;
      const currentPoint = lastTwoPoints.current;

      // Calculate the interpolated position
      const startX = timeScale(prevPoint.timestamp);
      const endX = timeScale(currentPoint.timestamp);
      const currentX = startX + (endX - startX) * newSegmentProgress;

      // Add the last point based on the animation progress
      d += ` L ${currentX},${chartBottom}`;
    } else {
      // Add the last point at the bottom right
      const lastPoint = priceData[priceData.length - 1];
      const lastX = timeScale(lastPoint.timestamp);
      d += ` L ${lastX},${chartBottom}`;
    }

    // Close the path
    d += " Z";

    return d;
  }, [
    priceData,
    timeScale,
    priceScale,
    chartHeight,
    padding.y,
    timeAxisHeight,
    isAnimatingNewSegment,
    lastTwoPoints,
    newSegmentProgress,
  ]);

  // Calculate animation duration based on price change and zoom
  const calculateAnimationDuration = useMemo(() => {
    if (!priceData || priceData.length < 2) return 2500; // Increased base duration

    const lastPoint = priceData[priceData.length - 1];
    const prevPoint = priceData[priceData.length - 2];
    
    // Calculate price change percentage
    const priceChangePercent = Math.abs(
      ((lastPoint.price - prevPoint.price) / prevPoint.price) * 100
    );

    // Base duration is 2500ms
    let duration = 2500;

    // Adjust duration based on price change percentage
    // For small changes (< 0.1%), use longer duration
    if (priceChangePercent < 0.1) {
      duration = 3500;
    }
    // For medium changes (0.1% - 1%), use medium duration
    else if (priceChangePercent < 1) {
      duration = 3000;
    }
    // For large changes (> 1%), use shorter duration
    else {
      duration = 2500;
    }

    // Adjust duration based on zoom level
    // Get the visible time range from timeScale
    const timeRange = timeScale.domain();
    const totalRange = timeRange[1] - timeRange[0];
    
    // Adjust duration based on visible time range
    // Shorter range (more zoomed in) = faster animation
    if (totalRange < 3600000) {
      // Less than 1 hour
      duration *= 0.85;
    } else if (totalRange < 86400000) {
      // Less than 1 day
      duration *= 0.9;
    }

    return duration;
  }, [priceData, timeScale]);

  // Calculate path length and position circle directly on the path
  useEffect(() => {
    if (!pathRef.current || !linePath) return;

    try {
      // Get total path length
      const totalLength = pathRef.current.getTotalLength();

      // Set up path animation with dynamic duration
      pathRef.current.style.transition = `
        stroke-dashoffset 3s cubic-bezier(0.16, 1, 0.3, 1),
        stroke 2s cubic-bezier(0.16, 1, 0.3, 1),
        stroke-width 2s cubic-bezier(0.16, 1, 0.3, 1),
        filter 2s cubic-bezier(0.16, 1, 0.3, 1)
      `;
      pathRef.current.style.strokeDasharray = `${totalLength}`;
      pathRef.current.style.willChange = "stroke-dashoffset, stroke, stroke-width, filter";

      // Position the circle at the path end or at the animation point
      let point;

      if (
        isAnimatingNewSegment &&
        lastTwoPoints?.prev &&
        lastTwoPoints?.current
      ) {
        // Position circle at the animated point during segment animation
        const prevPoint = lastTwoPoints.prev;
        const currentPoint = lastTwoPoints.current;

        // Calculate the interpolated position with improved precision
        const startX = timeScale(prevPoint.timestamp);
        const startY = priceScale(prevPoint.price);
        const endX = timeScale(currentPoint.timestamp);
        const endY = priceScale(currentPoint.price);

        // Use a more precise interpolation for smoother movement
        const progress = Math.min(Math.max(newSegmentProgress, 0), 1);
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;

        point = { x, y };
      } else if (priceData.length > 0) {
        // For non-animating state, use the last point
        const lastPoint = priceData[priceData.length - 1];
        const x = timeScale(lastPoint.timestamp);
        const y = priceScale(lastPoint.price);
        point = { x, y };
      } else {
        // Fallback to path end if no data
        point = pathRef.current.getPointAtLength(totalLength);
      }

      // Set circle position with improved animation
      setCirclePosition({ x: point.x, y: point.y });
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error("Error calculating path points:", error);
      }
    }
  }, [
    linePath,
    timeScale,
    priceScale,
    isAnimatingNewSegment,
    lastTwoPoints,
    newSegmentProgress,
    priceData,
    calculateAnimationDuration,
  ]);

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
        </defs>

        {/* Area path with gradient fill */}
        <path
          data-testid="price-area"
          d={areaPath}
          fill="url(#areaGradient)"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "fill 0.7s ease-out",
          }}
        />

        {/* Main price path */}
        <path
          data-testid="price-path"
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{
            filter: `drop-shadow(0 12px 24px ${glowColor})`,
            transition: `
              stroke-dashoffset 3s cubic-bezier(0.16, 1, 0.3, 1),
              stroke 2s cubic-bezier(0.16, 1, 0.3, 1),
              stroke-width 2s cubic-bezier(0.16, 1, 0.3, 1),
              filter 2s cubic-bezier(0.16, 1, 0.3, 1)
            `,
            willChange: "stroke-dashoffset, stroke, stroke-width, filter"
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Delayed path */}
        {isAnimatingDelayedPath && (
          <path
            data-testid="delayed-path"
            ref={delayedPathRef}
            d={delayedPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            style={{
              filter: `drop-shadow(0 12px 24px ${glowColor})`,
              opacity: 0.7,
              transition:
                "stroke 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Animated new segment - only shown during animation */}
        {isAnimatingNewSegment && (
          <path
            data-testid="animated-segment"
            d={animatedSegmentPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            style={{
              filter: `drop-shadow(0 12px 24px ${glowColor})`,
              transition: "stroke 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Circle indicator on path */}
        <circle
          data-testid="indicator-circle"
          ref={circleRef}
          cx={circlePosition.x}
          cy={circlePosition.y}
          r={circleRadius}
          fill={"#fff"}
          stroke={darkMode ? COLORS.background : "#fff"}
          strokeWidth={strokeWidth * 0.7}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
            transition: isAnimatingNewSegment
              ? "none" // Disable transition during segment animation for precise movement
              : "fill 0.1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.1s cubic-bezier(0.4, 0, 0.2, 1), cx 0.1s cubic-bezier(0.4, 0, 0.2, 1), cy 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
            transform: "translateZ(0)", // Force GPU acceleration
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
