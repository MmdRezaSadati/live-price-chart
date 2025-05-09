"use client";

import { useMemo } from "react";
import { PricePoint } from "../types/chart";
import { D3ScaleFunction } from "../types/chart";
import * as d3 from "d3";

export interface PathCalculationProps {
  priceData: PricePoint[];
  timeScale: D3ScaleFunction;
  priceScale: D3ScaleFunction;
  chartHeight: number;
  padding: { x: number; y: number };
  timeAxisHeight: number;
  isAnimatingNewSegment: boolean;
  lastTwoPoints?: {
    prev: PricePoint | null;
    current: PricePoint | null;
  };
  newSegmentProgress: number;
  delayedPathData?: PricePoint[];
  delayedPathProgress: number;
}

export const useChartPathCalculation = ({
  priceData,
  timeScale,
  priceScale,
  chartHeight,
  padding,
  timeAxisHeight,
  isAnimatingNewSegment,
  lastTwoPoints,
  newSegmentProgress,
  delayedPathData = [],
  delayedPathProgress,
}: PathCalculationProps) => {
  // Calculate line path string based on price data
  const linePath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale) return "";

    // Convert data to appropriate format for d3.line
    const formattedData: [number, number][] = priceData.map((point) => [timeScale(point.timestamp), priceScale(point.price)]);

    // Create path with d3.line and curveCardinal
    const lineGenerator = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCardinal);

    return lineGenerator(formattedData) || "";
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
    const visiblePoints = Math.max(
      2,
      Math.ceil(delayedPathData.length * delayedPathProgress)
    );

    delayedPathData.slice(0, visiblePoints).forEach((point, i) => {
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);
      d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });

    return d;
  }, [delayedPathData, timeScale, priceScale, delayedPathProgress]);

  // Calculate the animated new segment
  const animatedSegmentPath = useMemo(() => {
    if (
      !isAnimatingNewSegment ||
      !lastTwoPoints?.prev ||
      !lastTwoPoints?.current ||
      !timeScale ||
      !priceScale
    ) {
      return "";
    }

    const { prev: prevPoint, current: currentPoint } = lastTwoPoints;
    const startX = timeScale(prevPoint.timestamp);
    const startY = priceScale(prevPoint.price);
    const endX = timeScale(currentPoint.timestamp);
    const endY = priceScale(currentPoint.price);

    const currentX = startX + (endX - startX) * newSegmentProgress;
    const currentY = startY + (endY - startY) * newSegmentProgress;

    return `M ${startX},${startY} L ${currentX},${currentY}`;
  }, [
    isAnimatingNewSegment,
    lastTwoPoints,
    timeScale,
    priceScale,
    newSegmentProgress,
  ]);

  // Calculate area path for the filled gradient area
  const areaPath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale || priceData.length < 2)
      return "";

    const chartBottom = chartHeight - padding.y * 2 - timeAxisHeight;
    let d = "";

    // Start at the bottom left
    const firstPoint = priceData[0];
    const firstX = timeScale(firstPoint.timestamp);
    d += `M ${firstX},${chartBottom} L ${firstX},${priceScale(
      firstPoint.price
    )}`;

    // Follow the line path
    priceData.slice(1).forEach((point) => {
      const x = timeScale(point.timestamp);
      const y = priceScale(point.price);
      d += ` L ${x},${y}`;
    });

    // Handle animated segment or close the path
    if (
      isAnimatingNewSegment &&
      lastTwoPoints?.prev &&
      lastTwoPoints?.current
    ) {
      const startX = timeScale(lastTwoPoints.prev.timestamp);
      const endX = timeScale(lastTwoPoints.current.timestamp);
      const currentX = startX + (endX - startX) * newSegmentProgress;
      d += ` L ${currentX},${chartBottom}`;
    } else {
      const lastPoint = priceData[priceData.length - 1];
      d += ` L ${timeScale(lastPoint.timestamp)},${chartBottom}`;
    }

    return d + " Z";
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

  return {
    linePath,
    delayedPath,
    animatedSegmentPath,
    areaPath,
  };
};
