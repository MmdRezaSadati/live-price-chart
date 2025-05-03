"use client";

import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for price animation
 * Smoothly animates price changes
 * 
 * @param currentPrice Current price received from WebSocket
 * @param zoomPrecision How much to zoom in/out on the chart
 * @param onPriceUpdate Optional callback for when price updates
 * @returns The animated price value and animation progress
 */
export const usePriceAnimation = (
  currentPrice: number | null, 
  zoomPrecision: number,
  onPriceUpdate?: (price: number) => void
) => {
  const [animatedPrice, setAnimatedPrice] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (currentPrice === null || animatedPrice === null) {
      if (currentPrice !== null) {
        setAnimatedPrice(currentPrice);
      }
      return;
    }
    
    // Calculate animation parameters based on price difference
    const priceDiff = Math.abs(currentPrice - animatedPrice);
    const maxChange = zoomPrecision * 0.8;
    const cappedDiff = Math.min(priceDiff, maxChange);
    
    // Skip animation for large jumps
    if (priceDiff > maxChange) {
      setAnimatedPrice(currentPrice > animatedPrice 
        ? currentPrice - maxChange * 0.2
        : currentPrice + maxChange * 0.2);
      return;
    }
    
    // Dynamic duration based on price change
    const duration = Math.min(1000 + (cappedDiff * 700), 1200);
    
    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Start the animation
    const startTime = performance.now();
    const initialPrice = animatedPrice;
    
    const animatePrice = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const newAnimatedPrice = initialPrice + (currentPrice - initialPrice) * easeProgress;
      
      setAnimatedPrice(newAnimatedPrice);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animatePrice);
      } else {
        // Animation complete
        setAnimatedPrice(currentPrice);
        animationRef.current = null;
        
        if (onPriceUpdate) {
          onPriceUpdate(currentPrice);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animatePrice);
    
    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentPrice, animatedPrice, onPriceUpdate, zoomPrecision]);
  
  return animatedPrice;
};

/**
 * Custom hook for line drawing animation
 * Animates new segments of the chart line
 * 
 * @param isNewPoint Whether a new data point was added
 * @param setIsNewPoint Function to update the isNewPoint state
 * @returns Line drawing progress (0.9-1.0 where 1.0 means fully drawn)
 */
export const useLineDrawAnimation = (isNewPoint: boolean, setIsNewPoint: (value: boolean) => void) => {
  const [lineDrawProgress, setLineDrawProgress] = useState(1);
  const lineAnimationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    if (!isNewPoint) return;
    
    // Cancel any ongoing animation
    if (lineAnimationRef.current !== null) {
      cancelAnimationFrame(lineAnimationRef.current);
      lineAnimationRef.current = null;
    }
    
    // Animation parameters
    const duration = 600;
    const startTime = performance.now();
    
    // Start at 0.9 to only animate the new segment (last 10%)
    setLineDrawProgress(0.9);
    
    // Animation function
    const animateLine = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const newProgress = 0.9 + easeProgress * 0.1; // Only animate from 0.9 to 1.0
      
      setLineDrawProgress(newProgress);
      
      if (progress < 1) {
        lineAnimationRef.current = requestAnimationFrame(animateLine);
      } else {
        // Animation complete
        setLineDrawProgress(1);
        lineAnimationRef.current = null;
        setIsNewPoint(false);
      }
    };
    
    lineAnimationRef.current = requestAnimationFrame(animateLine);
    
    // Cleanup
    return () => {
      if (lineAnimationRef.current !== null) {
        cancelAnimationFrame(lineAnimationRef.current);
      }
    };
  }, [isNewPoint, setIsNewPoint]);
  
  return lineDrawProgress;
}; 