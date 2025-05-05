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
  zoomPrecision: number = 1,
  onPriceUpdate?: (price: number) => void
) => {
  const [animatedPrice, setAnimatedPrice] = useState(currentPrice ?? 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPriceRef = useRef<number>(0);
  const targetPriceRef = useRef<number>(0);

  useEffect(() => {
    // Skip if price hasn't been set yet
    if (currentPrice === null) return;
    
    // If this is the first price or no animation is needed, set it immediately
    if (animatedPrice === 0 || Math.abs(currentPrice - animatedPrice) < (currentPrice * 0.0001 * zoomPrecision)) {
      setAnimatedPrice(currentPrice);
      if (onPriceUpdate) {
        onPriceUpdate(currentPrice);
      }
      return;
    }
    
    // Set up animation parameters
    startTimeRef.current = performance.now();
    startPriceRef.current = animatedPrice;
    targetPriceRef.current = currentPrice;
    setIsAnimating(true);
    
    // Start animation if not already running
    if (!animationRef.current) {
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTimeRef.current;
        const duration = 1500; // افزایش از 1000 به 1500 برای انیمیشن نرم‌تر
        
        if (elapsed < duration) {
          // Calculate progress with smoother easing
          const progress = elapsed / duration;
          // استفاده از تابع easing پیچیده‌تر برای حرکت نرم‌تر
          const easedProgress = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          // Calculate new price
          const newPrice = startPriceRef.current + 
            (targetPriceRef.current - startPriceRef.current) * easedProgress;
          
          // Update animated price
          setAnimatedPrice(newPrice);
          
          // Call the optional callback
          if (onPriceUpdate) {
            onPriceUpdate(newPrice);
          }
          
          // Continue animation
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // End of animation
          setAnimatedPrice(targetPriceRef.current);
          if (onPriceUpdate) {
            onPriceUpdate(targetPriceRef.current);
          }
          setIsAnimating(false);
          animationRef.current = null;
        }
      };
      
      // Start the animation
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentPrice, animatedPrice, zoomPrecision, onPriceUpdate]);
  
  return { animatedPrice, isAnimating };
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
  // Base position for continuous animation (0.95-1.0)
  const [basePosition, setBasePosition] = useState(0.98);
  
  // Visual progress showing how much of the line is visible (0.0-1.0)
  const [visiblePercent, setVisiblePercent] = useState(0.2); // Show last 20% by default
  
  // Track animation state
  const animationRef = useRef<number | null>(null);
  const lastDataLengthRef = useRef<number>(0);
  const isAnimatingNewPointRef = useRef<boolean>(false);
  const lastCycleTimeRef = useRef<number>(performance.now());
  
  // The final progress value returned (combination of base position and new point animation)
  const [lineDrawProgress, setLineDrawProgress] = useState(0.98);
  
  // Start the continuous animation loop
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Continuous movement without resetting
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastCycleTimeRef.current;
      
      const cycleTime = CHART_ANIMATION.OSCILLATION_CYCLE;
      const minPosition = CHART_ANIMATION.OSCILLATION_RANGE.MIN;
      const maxPosition = CHART_ANIMATION.OSCILLATION_RANGE.MAX;
      const range = maxPosition - minPosition;
      
      // محاسبه progress با استفاده از تابع سینوسی نرم‌تر
      const cycleProgress = (elapsed % cycleTime) / cycleTime;
      const newBasePosition = minPosition + 
        (range * (Math.sin(cycleProgress * Math.PI * 2 - Math.PI/2) * 0.5 + 0.5));
      
      setBasePosition(newBasePosition);
      lastCycleTimeRef.current = timestamp;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation
    lastCycleTimeRef.current = performance.now();
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
    if (hasNewData && !isAnimatingNewPointRef.current && isNewPoint) {
      isAnimatingNewPointRef.current = true;
      
      // Store new data length
      lastDataLengthRef.current = priceData.length;
      
      // Ensure we're always continuing the line from where we are
      // This prevents resetting when new data arrives
      const startPosition = basePosition; // Current position
      const targetPosition = 1.0; // Target position (fully drawn)
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
        // Never go backward, only forward from the current position
        const newPosition = startPosition + 
          (targetPosition - startPosition) * easeProgress;
        
        // Update the base position but don't override the main animation
        if (progress < 1) {
          // Continue animation
          requestAnimationFrame(animateNewPoint);
        } else {
          // Animation complete
          isAnimatingNewPointRef.current = false;
          setIsNewPoint(false);
        }
      };
      
      // Start the new point animation
      requestAnimationFrame(animateNewPoint);
    }
  }, [priceData, isNewPoint, setIsNewPoint, basePosition]);
  
  // Calculate final line draw progress based on base position
  useEffect(() => {
    // We always want to show at least the most recent data
    const visibleRange = 0.2; // Show 20% of the chart
    
    // Always use at least 0.95 to ensure we never reset too far back
    setLineDrawProgress(Math.max(0.95, basePosition));
    setVisiblePercent(visibleRange);
  }, [basePosition]);
  
  return {
    lineDrawProgress, 
    visiblePercent, 
    basePosition
  };
}; 