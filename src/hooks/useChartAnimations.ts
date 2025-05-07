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
    
    // If this is the first price, set it immediately
    if (animatedPrice === 0) {
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
        // Use a longer duration for smoother transitions
        const duration = 2000; 
        
        if (elapsed < duration) {
          // Calculate progress with smoother easing
          const progress = elapsed / duration;
          
          // Custom easing curve for very smooth transition
          const easedProgress = cubicBezier(0.25, 0.1, 0.25, 1.0, progress);
          
          // Calculate new price with smoother transition
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
  }, [currentPrice, animatedPrice, onPriceUpdate]);
  
  return { animatedPrice, isAnimating };
};

/**
 * Custom hook for animating the extension of a line to new data points
 * Creates a smooth animation effect for new points being added
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
  // State for animation progress of the newest segment (0.0 to 1.0)
  const [newSegmentProgress, setNewSegmentProgress] = useState(1.0);
  
  // State for whether we're currently animating a new segment
  const [isAnimatingNewSegment, setIsAnimatingNewSegment] = useState(false);
  
  // Previous data length to detect new points
  const prevDataLengthRef = useRef<number>(0);
  
  // Animation frame reference for cleanup
  const animationRef = useRef<number | null>(null);
  
  // The last two points for segment animation
  const lastTwoPointsRef = useRef<{prev: PricePoint | null, current: PricePoint | null}>({
    prev: null,
    current: null
  });

  // Monitor for new data points and animate segments
  useEffect(() => {
    if (!priceData || priceData.length < 2) return;
    
    const currentLength = priceData.length;
    
    // If we have new data and we're not already animating
    if (currentLength > prevDataLengthRef.current && isNewPoint && !isAnimatingNewSegment) {
      // We have a new data point - capture the last two points
      const prevPoint = priceData[currentLength - 2];
      const newPoint = priceData[currentLength - 1];
      
      // Store points for animation reference
      lastTwoPointsRef.current = {
        prev: prevPoint,
        current: newPoint
      };
      
      // Start animating from 0 to show the new segment gradually
      setNewSegmentProgress(0);
      setIsAnimatingNewSegment(true);
      
      // Set up animation
      const startTime = performance.now();
      const duration = 1500; // 1.5 seconds for smooth drawing
      
      const animateSegment = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use cubic-bezier easing for very smooth animation
        const easedProgress = cubicBezier(0.16, 1, 0.3, 1, progress);
        
        // Update the segment drawing progress
        setNewSegmentProgress(easedProgress);
        
        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animateSegment);
        } else {
          // Animation complete
          setNewSegmentProgress(1.0);
          setIsAnimatingNewSegment(false);
          setIsNewPoint(false);
          animationRef.current = null;
        }
      };
      
      // Clean up any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start the segment animation
      animationRef.current = requestAnimationFrame(animateSegment);
    }
    
    // Update the previous length
    prevDataLengthRef.current = currentLength;
  }, [priceData, isNewPoint, setIsNewPoint, isAnimatingNewSegment]);
  
  // Clean up any animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return {
    // Always show all but the last segment completely
    lineDrawProgress: 1.0,  
    // Progress of only the newest segment animation
    newSegmentProgress,
    isAnimatingNewSegment,
    lastTwoPoints: lastTwoPointsRef.current
  };
};

/**
 * Cubic bezier easing function for smoother animations
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  // Cubic Bezier curve equation
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  
  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  
  // Find t for a given x using Newton-Raphson method
  let currentT = t;
  const epsilon = 1e-6;
  
  for (let i = 0; i < 8; i++) {
    const currentX = sampleCurveX(currentT) - t;
    if (Math.abs(currentX) < epsilon) {
      return sampleCurveY(currentT);
    }
    
    const derivative = sampleCurveDerivativeX(currentT);
    if (Math.abs(derivative) < epsilon) {
      break;
    }
    
    currentT -= currentX / derivative;
  }
  
  // Fallback to linear if Newton-Raphson fails
  return t;
} 