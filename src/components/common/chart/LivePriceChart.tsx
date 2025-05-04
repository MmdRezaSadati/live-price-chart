"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { LivePriceChartProps } from "../../../types/chart";
import { COLORS } from "../../../constants/chart";
import ChartHeader from "@/components/ChartHeader";
import { TimeRangeControls } from "./components/TimeRangeControls";
import { PricePath } from "./components/PricePath";
import { ChartStats } from "./components/ChartStats";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  useLineDrawAnimation,
  usePriceAnimation,
} from "@/hooks/useChartAnimations";
import { useChartScales } from "@/hooks/useChartScales";

/**
 * Bitcoin Live Price Chart Component
 *
 * Displays real-time Bitcoin price data with animations and responsive design
 */
const LivePriceChart = ({
  width = 800,
  height = 500,
  onPriceUpdate = () => {}, // Default no-op function
}: LivePriceChartProps) => {
  // Time range selection state
  const [timeRange, setTimeRange] = useState<string>("1m");
  const [chartColor, setChartColor] = useState<string>(COLORS.down);

  // Chart element references
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Zoom precision factor - controls how much the chart zooms in/out
  const zoomPrecision = 0.07; // Shows +/- $0.1 from current price

  // Setup WebSocket connection and get price data
  const {
    priceData,
    currentPrice,
    isNewPoint,
    setIsNewPoint,
    priceChange,
    priceChangeValue,
    lastPriceRef,
  } = useWebSocket(onPriceUpdate);

  const isPositiveChange = priceChange >= 0;
  // Animate price changes - destructure to get just the price value
  const { animatedPrice } = usePriceAnimation(currentPrice, zoomPrecision);

  // Animate line drawing for new points with continuous animation
  const { lineDrawProgress } = useLineDrawAnimation(
    isNewPoint,
    setIsNewPoint,
    priceData
  );

  // Update chart color based on price direction
  useEffect(() => {
    // No update needed if we don't have an animated price
    if (animatedPrice === 0) return;

    // Set color based on the last price comparison (stored in WebSocket hook)
    const lastPrice = lastPriceRef.current;
    if (lastPrice === null) return;

    // Update color based on price movement
    const colorToUse = isPositiveChange ? COLORS.up : COLORS.down;
    setChartColor(colorToUse);
  }, [animatedPrice, lastPriceRef, isPositiveChange]);

  // Calculate responsive sizes for chart elements
  const fontSize = useMemo(
    () => ({
      title: Math.max(16, Math.min(20, width / 40)),
      price: Math.max(18, Math.min(24, width / 33)),
      small: Math.max(10, Math.min(14, width / 57)),
      labels: Math.max(9, Math.min(11, width / 80)),
    }),
    [width]
  );

  const iconSize = useMemo(
    () => Math.max(28, Math.min(40, width / 20)),
    [width]
  );
  const padding = useMemo(
    () => ({
      x: Math.max(16, Math.min(24, width / 40)),
      y: Math.max(10, Math.min(16, height / 31)),
    }),
    [width, height]
  );
  const circleRadius = useMemo(
    () => Math.max(4, Math.min(6, width / 150)),
    [width]
  );
  const strokeWidth = useMemo(
    () => Math.max(2, Math.min(3, width / 300)),
    [width]
  );
  const headerHeight = useMemo(
    () => Math.max(50, Math.min(70, height / 7)),
    [height]
  );

  // Setup scales and path generators for the chart
  const { timeScale, priceScale } = useChartScales(
    priceData,
    {
      width,
      height,
      padding,
      headerHeight
    },
    {
      animatedPrice,
      zoomPrecision
    }
  );

  // Handle time range selection
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // In a real implementation, this would fetch different timeframe data
  };

  // Loading state
  if (
    typeof window === "undefined" ||
    priceData.length < 2 ||
    !timeScale ||
    !priceScale ||
    animatedPrice === 0
  ) {
    return (
      <div
        role="status"
        className="flex items-center justify-center w-full h-full rounded-xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: COLORS.background, width, height }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: `${COLORS.accent} transparent ${COLORS.accent} ${COLORS.accent}`,
            }}
          ></div>
          <p className="text-lg font-bold" style={{ color: COLORS.accent }}>
            Loading Bitcoin data...
          </p>
        </div>
      </div>
    );
  }

  // Format data for display
  const formattedPrice = typeof animatedPrice === 'number' ? animatedPrice.toFixed(2) : '0.00';
  const formattedChange = typeof priceChange === 'number' ? priceChange.toFixed(2) : '0.00';
  const glowColor = isPositiveChange ? COLORS.upGlow : COLORS.downGlow;

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-2xl w-full h-full"
      ref={chartContainerRef}
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Chart Header */}
      <ChartHeader
        price={formattedPrice}
        priceColor={chartColor}
        glowColor={glowColor}
        priceChange={formattedChange}
        priceChangeValue={priceChangeValue}
        isPositiveChange={isPositiveChange}
        fontSize={fontSize}
        iconSize={iconSize}
        padding={padding}
        headerHeight={headerHeight}
      />

      {/* Time Range Controls */}
      <TimeRangeControls
        selectedRange={timeRange}
        onRangeChange={handleTimeRangeChange}
        headerHeight={headerHeight}
        padding={padding}
        fontSize={{ small: fontSize.small }}
      />

      {/* Price Chart */}
      <PricePath
        priceData={priceData}
        timeScale={timeScale}
        priceScale={priceScale}
        width={width}
        height={height}
        headerHeight={headerHeight}
        padding={padding}
        chartColor={chartColor}
        glowColor={glowColor}
        strokeWidth={strokeWidth}
        circleRadius={circleRadius}
        fontSize={{ labels: fontSize.labels }}
        lineDrawProgress={lineDrawProgress}
        priceChange={priceChange}
        darkMode={true}
      />

      {/* Bottom Stats */}
      <ChartStats
        fontSize={{
          small: fontSize.small,
          labels: fontSize.labels,
        }}
        padding={padding}
      />
    </div>
  );
};

export default LivePriceChart;
