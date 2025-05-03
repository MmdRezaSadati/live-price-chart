"use client";

import { PricePathProps } from "../../../../types/chart";
import { COLORS as colors } from "@/constants/chart";
import { useEffect, useRef, useMemo, useState } from "react";

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
  chartColor,
  glowColor,
  linePath,
  visibleEndPoint,
  animatedPrice,
  strokeWidth,
  circleRadius,
  onLinePathRef,
  onCircleRef,
  fontSize,
  lineDrawProgress = 1.0,
}: PricePathProps) => {
  // Local reference to path element for animation
  const pathRef = useRef<SVGPathElement | null>(null);
  const areaPathRef = useRef<SVGPathElement | null>(null);
  const [animatedEndPoint, setAnimatedEndPoint] = useState(visibleEndPoint);
  const [clipPathData, setClipPathData] = useState('');
  
  // Apply stroke-dasharray and stroke-dashoffset directly
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !linePath) return;
    
    // Get the total length of the path
    const length = path.getTotalLength() || 1000;
    
    // Set the dash array to the path length
    path.style.strokeDasharray = `${length}`;
    
    // Calculate dash offset to create the drawing effect
    // lineDrawProgress = 1.0 means fully drawn, 0.0 means not drawn at all
    const dashOffset = length * (1 - lineDrawProgress);
    path.style.strokeDashoffset = `${dashOffset}`;
    
    // Calculate the point on the path at the current animation position
    if (path && lineDrawProgress > 0) {
      try {
        // Find the point on the path at the current progress
        const pointOnPath = path.getPointAtLength(length * lineDrawProgress);
        
        // Update the animated end point
        setAnimatedEndPoint({
          x: pointOnPath.x,
          y: pointOnPath.y
        });
        
        // Create a clipping path for the area fill
        // This creates a path from 0,0 to the current position, then down to the bottom
        // to create an exact matching fill area
        if (priceData.length > 0) {
          const areaBottom = height - headerHeight - padding.y * 2;
          const clipPath = `M 0,0 H ${pointOnPath.x} V ${areaBottom} H 0 Z`;
          setClipPathData(clipPath);
        }
      } catch {
        // Fallback if getPointAtLength fails
        setAnimatedEndPoint(visibleEndPoint);
      }
    }
  }, [linePath, lineDrawProgress, visibleEndPoint, priceData.length, height, headerHeight, padding.y]);
  
  // Generate area fill path for the entire chart
  const areaPath = useMemo(() => {
    if (!linePath || !priceData.length) return '';
    
    const areaBottom = height - headerHeight - padding.y * 2;
    return `${linePath} L ${timeScale(priceData[priceData.length-1].timestamp)},${areaBottom} L ${timeScale(priceData[0].timestamp)},${areaBottom} Z`;
  }, [linePath, priceData, height, headerHeight, padding.y, timeScale]);
  
  // Forward the ref
  const setPathRef = (ref: SVGPathElement | null) => {
    pathRef.current = ref;
    onLinePathRef(ref);
  };
  
  return (
    <svg
      width={width}
      height={height - headerHeight}
      style={{ marginTop: `${headerHeight}px` }}
    >
      {/* Grid lines with values */}
      {Array.from({ length: 5 }, (_, i) => {
        const price =
          animatedPrice -
          animatedPrice * 0.002 +
          (i * (animatedPrice * 0.004)) / 4;
        const y = priceScale(price);
        return (
          <g key={`grid-${i}`} className="transition-all duration-700">
            <line
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={colors.grid}
              strokeDasharray="3,5"
              strokeWidth={1}
            />
            <text
              x={padding.x / 2}
              y={y - 6}
              fill={colors.gridText}
              fontSize={fontSize.labels}
              className="font-mono"
            >
              ${price.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Time axis line */}
      <line
        x1={0}
        y1={height - headerHeight - padding.y * 2}
        x2={width}
        y2={height - headerHeight - padding.y * 2}
        stroke={colors.grid}
        strokeWidth={1}
      />

      {/* Chart Area with gradient fill */}
      <g>
        {/* Area fill under the line with gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0.05" />
          </linearGradient>
          
          {/* Custom clipping path that exactly follows the visible part of the line */}
          <clipPath id="areaClip">
            <path d={clipPathData} />
          </clipPath>
        </defs>

        {/* Fill area under the curve - synchronized with animation using custom clip-path */}
        {areaPath && (
          <path
            ref={areaPathRef}
            d={areaPath}
            fill="url(#areaGradient)"
            opacity="0.6"
            clipPath="url(#areaClip)"
          />
        )}

        {/* Price path with animation and glow */}
        <path
          ref={setPathRef}
          d={linePath}
          fill="none"
          stroke={chartColor}
          strokeWidth={strokeWidth}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circle indicator on path - positioned using the animated point from the path */}
        <circle
          ref={onCircleRef}
          cx={animatedEndPoint.x}
          cy={animatedEndPoint.y}
          r={circleRadius}
          fill={chartColor}
          stroke="#fff"
          strokeWidth={strokeWidth * 0.7}
          className="animate-pulse"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />

        {/* Latest price marker line */}
        <line
          x1={padding.x}
          y1={priceScale(animatedPrice)}
          x2={width - padding.x}
          y2={priceScale(animatedPrice)}
          stroke={chartColor}
          strokeWidth={1}
          strokeDasharray="1,3"
          style={{ opacity: 0.5 }}
        />
      </g>
    </svg>
  );
};
