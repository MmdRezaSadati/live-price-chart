"use client";

import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { scaleLinear } from '@visx/scale';
import { PricePoint } from '@/types/chart';

/**
 * Custom hook to calculate chart scales and constraints
 * 
 * @param priceData Array of price points
 * @param animatedPrice Current animated price
 * @param width Chart width
 * @param height Chart height
 * @param zoomPrecision Zoom precision factor
 * @param headerHeight Height of the chart header
 * @param padding Chart padding
 * @returns All necessary scales and path functions
 */
export const useChartScales = (
  priceData: PricePoint[],
  animatedPrice: number | null,
  width: number,
  height: number,
  zoomPrecision: number,
  headerHeight: number,
  padding: { x: number, y: number }
) => {
  // Time scale (X-axis)
  const timeScale = useMemo(() => {
    if (priceData.length < 2) return null;
    
    // Add padding to the right side
    const rightPadding = padding.x * 4;
    
    return scaleLinear({
      domain: [
        d3.min(priceData, d => d.timestamp) ?? 0,
        d3.max(priceData, d => d.timestamp) ?? 0
      ],
      range: [0, width - rightPadding],
    });
  }, [priceData, width, padding.x]);

  // Price scale (Y-axis)
  const priceScale = useMemo(() => {
    if (priceData.length < 2 || animatedPrice === null) return null;
    
    // Range around the current price
    const priceRange = zoomPrecision;
    
    return scaleLinear({
      domain: [
        animatedPrice - priceRange,
        animatedPrice + priceRange
      ],
      range: [height - headerHeight - padding.y * 2, padding.y * 2], // Padding on top and bottom
    });
  }, [priceData, height, animatedPrice, zoomPrecision, headerHeight, padding.y]);
  
  // Price bounds to keep elements in view
  const priceBounds = useMemo(() => {
    if (animatedPrice === null) return { min: 0, max: 100 };
    
    return {
      min: animatedPrice - zoomPrecision,
      max: animatedPrice + zoomPrecision
    };
  }, [animatedPrice, zoomPrecision]);

  // Function to constrain prices to visible area
  const constrainPrice = useCallback((price: number): number => {
    const padding = zoomPrecision * 0.1;
    return Math.min(Math.max(price, priceBounds.min + padding), priceBounds.max - padding);
  }, [priceBounds, zoomPrecision]);

  // Generate path for the price line
  const generateLinePath = useCallback((data: PricePoint[]): string => {
    if (!timeScale || !priceScale || data.length < 2) return '';
    
    const lineGenerator = d3.line<PricePoint>()
      .x(d => timeScale(d.timestamp))
      .y(d => {
        const constrainedPrice = constrainPrice(d.price);
        return priceScale(constrainedPrice);
      })
      .curve(d3.curveCatmullRom.alpha(0.5)); // Smooth curve
    
    return lineGenerator(data) || '';
  }, [timeScale, priceScale, constrainPrice]);

  return {
    timeScale,
    priceScale,
    priceBounds,
    constrainPrice,
    generateLinePath,
  };
}; 