"use client";

import { PricePathProps } from "../../../../types/chart";

import { COLORS as colors } from "@/constants/chart";
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
}: PricePathProps) => {
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
        </defs>

        {/* Fill area under the curve */}
        {linePath && priceData.length > 0 && (
          <path
            d={`${linePath} L ${timeScale(
              priceData[priceData.length - 1].timestamp
            )},${height - headerHeight - padding.y * 2} L ${timeScale(
              priceData[0].timestamp
            )},${height - headerHeight - padding.y * 2} Z`}
            fill="url(#areaGradient)"
            opacity="0.6"
          />
        )}

        {/* Price path with animation and glow */}
        <path
          ref={onLinePathRef}
          d={linePath}
          fill="none"
          stroke={chartColor}
          strokeWidth={strokeWidth}
          style={{
            transition:
              "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0s",
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circle indicator on path */}
        <circle
          ref={onCircleRef}
          cx={visibleEndPoint.x}
          cy={visibleEndPoint.y}
          r={circleRadius}
          fill={chartColor}
          stroke="#fff"
          strokeWidth={strokeWidth * 0.7}
          className="animate-pulse"
          style={{
            transition: "none",
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
