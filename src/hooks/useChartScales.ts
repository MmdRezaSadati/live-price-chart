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
  animatedPrice: number,
  width: number,
  height: number,
  zoomPrecision: number,
  headerHeight: number,
  padding: { x: number, y: number }
) => {
  // Calculate dynamic price range to ensure all prices are visible
  const dynamicPriceRange = useMemo(() => {
    if (priceData.length < 2) return zoomPrecision;
    
    // Calculate the min and max prices in the current data
    const minPrice = d3.min(priceData, d => d.price) || 0;
    const maxPrice = d3.max(priceData, d => d.price) || 0;
    
    // Calculate the needed range to show all prices
    const dataRange = maxPrice - minPrice;
    
    // Use either the default range or the data range plus a buffer, whichever is larger
    const buffer = dataRange * 0.3; // 30% buffer on top and bottom
    return Math.max(zoomPrecision, dataRange + buffer);
  }, [priceData, zoomPrecision]);

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
      range: [padding.x, width - rightPadding],
    });
  }, [priceData, width, padding.x]);

  // Find the price range for scaling
  const priceRangeBounds = useMemo(() => {
    if (priceData.length < 2 || !animatedPrice) return { min: 0, max: 100 };
    
    // Get min and max prices from the data
    const minDataPrice = d3.min(priceData, d => d.price) || animatedPrice;
    const maxDataPrice = d3.max(priceData, d => d.price) || animatedPrice;
    
    // Calculate a safe range that includes all data points
    const range = dynamicPriceRange * 0.5; // Half the range for above and below
    const midPrice = (minDataPrice + maxDataPrice) / 2; // Use mid-point of price data
    
    return {
      min: midPrice - range,
      max: midPrice + range
    };
  }, [priceData, animatedPrice, dynamicPriceRange]);

  // Price scale (Y-axis)
  const priceScale = useMemo(() => {
    if (priceData.length < 2 || !animatedPrice) return null;
    
    // Use the calculated safe price range
    return scaleLinear({
      domain: [
        priceRangeBounds.min,
        priceRangeBounds.max
      ],
      // Add extra padding to top and bottom to ensure visibility
      range: [height - headerHeight - padding.y, padding.y * 2], 
    });
  }, [priceData, height, animatedPrice, headerHeight, padding.y, priceRangeBounds]);
  
  // Price bounds to keep elements in view
  const priceBounds = useMemo(() => {
    if (!animatedPrice) return { min: 0, max: 100 };
    
    // Use the calculated price range bounds
    return priceRangeBounds;
  }, [animatedPrice, priceRangeBounds]);

  // Function to constrain prices to visible area with improved safety margins
  const constrainPrice = useCallback((price: number): number => {
    // Ensure the price is always kept within the visible bounds with a safety margin
    const safetyMargin = (priceBounds.max - priceBounds.min) * 0.05; // 5% margin
    const min = priceBounds.min + safetyMargin;
    const max = priceBounds.max - safetyMargin;
    
    return Math.min(Math.max(price, min), max);
  }, [priceBounds]);

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