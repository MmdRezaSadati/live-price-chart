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
  curve?: d3.CurveFactory;
  interpolationPoints?: number;
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
  curve = d3.curveBasis,
  interpolationPoints = 100,
}: PathCalculationProps) => {
  // Calculate line path string based on price data
  const linePath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale) return "";

    // Convert data to appropriate format for d3.line
    const formattedData: [number, number][] = priceData.map((point) => [timeScale(point.timestamp), priceScale(point.price)]);

    // Create path with d3.line and specified curve
    const lineGenerator = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curve);

    // Add interpolation points for smoother curves
    if (interpolationPoints > 0) {
      const interpolatedData: [number, number][] = [];
      
      // Add control points at the start and end for smoother curves
      if (formattedData.length > 0) {
        const firstPoint = formattedData[0];
        const secondPoint = formattedData[1];
        const controlPoint1 = [
          firstPoint[0] - (secondPoint[0] - firstPoint[0]) * 0.5,
          firstPoint[1] - (secondPoint[1] - firstPoint[1]) * 0.5,
        ];
        interpolatedData.push(controlPoint1 as [number, number]);
      }

      // Add main points with interpolation
      for (let i = 0; i < formattedData.length - 1; i++) {
        const current = formattedData[i];
        const next = formattedData[i + 1];
        interpolatedData.push(current);
        
        // Add interpolation points between current and next point
        for (let j = 1; j <= interpolationPoints; j++) {
          const t = j / (interpolationPoints + 1);
          // Use cubic interpolation for smoother curves
          const x = current[0] + (next[0] - current[0]) * t;
          const y = current[1] + (next[1] - current[1]) * t;
          interpolatedData.push([x, y]);
        }
      }

      // Add control point at the end
      if (formattedData.length > 1) {
        const lastPoint = formattedData[formattedData.length - 1];
        const secondLastPoint = formattedData[formattedData.length - 2];
        const controlPoint2 = [
          lastPoint[0] + (lastPoint[0] - secondLastPoint[0]) * 0.5,
          lastPoint[1] + (lastPoint[1] - secondLastPoint[1]) * 0.5,
        ];
        interpolatedData.push(lastPoint);
        interpolatedData.push(controlPoint2 as [number, number]);
      }

      return lineGenerator(interpolatedData) || "";
    }

    return lineGenerator(formattedData) || "";
  }, [priceData, timeScale, priceScale, curve, interpolationPoints]);

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
