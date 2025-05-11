"use client";
import { useSpring } from "@react-spring/web";
import { curveNatural } from "d3";
import * as d3 from "d3";
import { useMemo } from "react";
import { D3ScaleFunction, PricePoint } from "../types/chart";

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
  curve = curveNatural,
  interpolationPoints = 200,
}: PathCalculationProps) => {
  // Calculate circle position directly from the last data point using useMemo
  const computeCirclePositionOnPath = useMemo(() => {
    if (!priceData.length || !timeScale || !priceScale) {
      return { x: 0, y: 0 };
    }
    const lastPoint = priceData[priceData.length - 1];
    return {
      x: timeScale(lastPoint.timestamp),
      y: priceScale(lastPoint.price),
    };
  }, [priceData, timeScale, priceScale]);
  // Calculate base path (excluding the last point)
  const basePath = useMemo(() => {
    if (!priceData || !timeScale || !priceScale || priceData.length < 2)
      return "";

    // Use all points except the last one for the base path
    const baseData = priceData.slice(0, -1);
    const formattedData: [number, number][] = baseData.map((point) => [
      timeScale(point.timestamp),
      priceScale(point.price),
    ]);

    const lineGenerator = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curve);

    return lineGenerator(formattedData) || "";
  }, [priceData, timeScale, priceScale, curve]);

  // Calculate the animated new segment and circle position
  const { animatedPath, circlePosition } = useMemo(() => {
    if (
      !isAnimatingNewSegment ||
      !lastTwoPoints?.prev ||
      !lastTwoPoints?.current ||
      !timeScale ||
      !priceScale
    ) {
      return { animatedPath: "", circlePosition: null };
    }

    const { prev: prevPoint, current: currentPoint } = lastTwoPoints;
    const startX = timeScale(prevPoint.timestamp);
    const startY = priceScale(prevPoint.price);
    const endX = timeScale(currentPoint.timestamp);
    const endY = priceScale(currentPoint.price);

    // Calculate current position based on progress
    const currentX = startX + (endX - startX) * newSegmentProgress;
    const currentY = startY + (endY - startY) * newSegmentProgress;

    // Create a smooth curve for the new segment
    const controlPoint1X = startX + (endX - startX) * 0.5;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) * 0.5;
    const controlPoint2Y = endY;

    // Use cubic bezier for smooth animation
    const path = `M ${startX},${startY} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${currentX},${currentY}`;

    return {
      animatedPath: path,
      circlePosition: { x: currentX, y: currentY },
    };
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
    const formattedData: [number, number][] = priceData.map((point) => [
      timeScale(point.timestamp),
      priceScale(point.price),
    ]);

    // Add bottom points for area
    const areaData: [number, number][] = [
      ...formattedData,
      [formattedData[formattedData.length - 1][0], chartBottom],
      [formattedData[0][0], chartBottom],
    ];

    const areaGenerator = d3
      .area()
      .x((d) => d[0])
      .y0(chartBottom)
      .y1((d) => d[1]);

    return areaGenerator(areaData) || "";
  }, [
    priceData,
    timeScale,
    priceScale,
    chartHeight,
    padding.y,
    timeAxisHeight,
  ]);

  // Calculate delayed path string
  const delayedPath = useMemo(() => {
    if (
      !delayedPathData ||
      !timeScale ||
      !priceScale ||
      delayedPathData.length < 2
    )
      return "";

    const formattedData: [number, number][] = delayedPathData
      .slice(
        0,
        Math.max(2, Math.ceil(delayedPathData.length * delayedPathProgress))
      )
      .map((point) => [timeScale(point.timestamp), priceScale(point.price)]);

    const lineGenerator = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curve);

    return lineGenerator(formattedData) || "";
  }, [delayedPathData, timeScale, priceScale, delayedPathProgress, curve]);

  // Create a single spring animation for both path and circle
  const spring = useSpring({
    from: {
      d: animatedPath || '',
      x: computeCirclePositionOnPath?.x || 0,
      y: computeCirclePositionOnPath?.y || 0,
      areaPath: areaPath || '',
    },
    to: {
      d: animatedPath || '',
      x: computeCirclePositionOnPath?.x || 0,
      y: computeCirclePositionOnPath?.y || 0,
      areaPath: areaPath || '',
    },
    immediate: true,
    config: {
      tension: 0,
      friction: 0,
    },
  });

  // Calculate the final line path by combining base path and animated segment
  const finalLinePath = useMemo(() => {
    const animatedSegment = spring.d.get() || '';
    return basePath + animatedSegment;
  }, [basePath, spring.d]);

  // Create spring animations for paths
  const springCircle = useSpring({
    from: {
      areaPath: areaPath || '',
      linePath: finalLinePath || '',
      x: computeCirclePositionOnPath?.x || 0,
      y: computeCirclePositionOnPath?.y || 0,
    },
    to: {
      areaPath: areaPath || '',
      linePath: finalLinePath || '',
      x: computeCirclePositionOnPath?.x || 0,
      y: computeCirclePositionOnPath?.y || 0,
    },
    immediate: true,
    config: {
      tension: 800,
      friction: 0,
    },
  });

  // Create a single object for both path and circle position
  const animatedValues = useMemo(() => {
    const currentD = spring.d.get() || '';
    const currentX = spring.x.get() || 0;
    const currentY = spring.y.get() || 0;

    return {
      linePath: finalLinePath || '',
      delayedPath: delayedPath || '',
      animatedSegmentPath: currentD,
      areaPath: areaPath || '',
      circlePosition: { x: currentX, y: currentY },
      spring: springCircle,
    };
  }, [finalLinePath, delayedPath, spring.d, spring.x, spring.y, areaPath]);

  return animatedValues;
};
