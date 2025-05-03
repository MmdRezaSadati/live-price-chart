"use client";

import { useState, useRef, useEffect } from 'react';
import { CHART_ANIMATION } from '@/constants/chart';
import { PricePoint } from '@/types/chart';

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
  const lastCurrentPriceRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Initialize price if it's the first value
    if (currentPrice === null) return;
    
    if (animatedPrice === null) {
      setAnimatedPrice(currentPrice);
      lastCurrentPriceRef.current = currentPrice;
      return;
    }
    
    // Prevent re-animation if current price hasn't changed from last animation
    if (currentPrice === lastCurrentPriceRef.current) return;
    lastCurrentPriceRef.current = currentPrice;
    
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
    
    // Dynamic duration based on price change - use base duration from constants
    const duration = Math.min(CHART_ANIMATION.PRICE_CHANGE_DURATION, CHART_ANIMATION.PRICE_CHANGE_DURATION * (cappedDiff / maxChange));
    
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
  }, [currentPrice, zoomPrecision, onPriceUpdate, animatedPrice]);
  
  return animatedPrice;
};

/**
 * Custom hook for continuous line drawing animation
 * Creates a seamless, always-moving animation effect
 * 
 * @param isNewPoint Whether a new data point was added
 * @param setIsNewPoint Function to update the isNewPoint state
 * @param priceData Current price data array
 * @returns Animation state information for drawing the line
 */
export const useLineDrawAnimation = (
  isNewPoint: boolean, 
  setIsNewPoint: (value: boolean) => void,
  priceData: PricePoint[]
) => {
  // Base position for continuous animation (0.8-1.0)
  const [basePosition, setBasePosition] = useState(1.0);
  
  // Visual progress showing how much of the line is visible (0.0-1.0)
  const [visiblePercent, setVisiblePercent] = useState(0.2); // Show last 20% by default
  
  // Track animation state
  const animationRef = useRef<number | null>(null);
  const lastDataLengthRef = useRef<number>(0);
  const isAnimatingNewPointRef = useRef<boolean>(false);
  
  // The final progress value returned (combination of base position and new point animation)
  const [lineDrawProgress, setLineDrawProgress] = useState(1.0);
  
  // Start the continuous animation loop
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Instead of oscillation, use a continuous forward motion
    const startTime = performance.now();
    
    const animate = (timestamp: number) => {
      // Create a continuous forward movement
      // This will cause the line to progress and reset when it reaches the end
      const elapsed = timestamp - startTime;
      
      // Instead of oscillation, create a sawtooth wave pattern
      // that only moves forward (from 0.8 to 1.0) and then resets instantly to 0.8
      const cycleTime = CHART_ANIMATION.OSCILLATION_CYCLE;
      const minPosition = CHART_ANIMATION.OSCILLATION_RANGE.MIN;
      const maxPosition = CHART_ANIMATION.OSCILLATION_RANGE.MAX;
      const range = maxPosition - minPosition;
      
      // Calculate progress through the cycle (0.0 to 1.0)
      const cycleProgress = (elapsed % cycleTime) / cycleTime;
      
      // Linear movement from min to max
      const newBasePosition = minPosition + (cycleProgress * range);
      
      setBasePosition(newBasePosition);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle new data points
  useEffect(() => {
    if (!priceData || priceData.length === 0) return;
    
    // Check if we have new data points
    const hasNewData = priceData.length > lastDataLengthRef.current;
    
    // If we're not already animating a new point and have new data
    if (hasNewData && !isAnimatingNewPointRef.current) {
      isAnimatingNewPointRef.current = true;
      
      // Store new data length
      lastDataLengthRef.current = priceData.length;
      
      // Fast-forward animation when new data arrives
      // This creates a smooth transition to show the new data point
      const startPosition = basePosition; // Current position
      const targetPosition = 1.0; // Target position
      const duration = CHART_ANIMATION.LINE_DRAW_DURATION;
      const startTime = performance.now();
      
      const animateNewPoint = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing based on the constant settings
        let easeProgress;
        if (CHART_ANIMATION.LINE_EASING === 'cubic') {
          easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        } else {
          easeProgress = progress; // Default to linear if not specified
        }
        
        // Calculate how much of the new segment to draw
        const newBasePosition = startPosition + (targetPosition - startPosition) * easeProgress;
        setBasePosition(newBasePosition);
        
        if (progress < 1) {
          // Continue new point animation
          requestAnimationFrame(animateNewPoint);
        } else {
          // New point animation complete
          isAnimatingNewPointRef.current = false;
          setIsNewPoint(false);
        }
      };
      
      // Start the new point animation
      requestAnimationFrame(animateNewPoint);
    }
  }, [priceData, setIsNewPoint, basePosition]);
  
  // Calculate final line draw progress based on base position and visible percent
  useEffect(() => {
    // Calculate how much of the chart is visible
    // This makes sure we always show at least the latest 20% of data
    // while allowing the line to continuously move
    const visibleRange = 0.2; // Show 20% of the chart
    
    setLineDrawProgress(basePosition);
    setVisiblePercent(visibleRange);
  }, [basePosition]);
  
  return {
    lineDrawProgress, 
    visiblePercent, 
    basePosition
  };
}; 