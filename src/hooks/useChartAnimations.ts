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
  const lastUpdateTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const positionRef = useRef<number>(0);
  const targetRef = useRef<number>(0);

  useEffect(() => {
    // Skip if price hasn't been set yet
    if (currentPrice === null) return;
    
    // If this is the first price, set it immediately
    if (animatedPrice === 0) {
      setAnimatedPrice(currentPrice);
      positionRef.current = currentPrice;
      targetRef.current = currentPrice;
      if (onPriceUpdate) {
        onPriceUpdate(currentPrice);
      }
      return;
    }

    const now = performance.now();
    const deltaTime = now - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = now;

    // Update target and calculate new velocity
    const oldTarget = targetRef.current;
    targetRef.current = currentPrice;
    
    // Calculate velocity based on target change
    if (deltaTime > 0) {
      const targetDelta = currentPrice - oldTarget;
      velocityRef.current = targetDelta / deltaTime;
    }

    // Start animation if not already running
    if (!animationRef.current) {
      const animate = (timestamp: number) => {
        const now = performance.now();
        const deltaTime = Math.min(now - lastUpdateTimeRef.current, 32); // Cap at 32ms for stability
        lastUpdateTimeRef.current = now;

        // Spring physics parameters
        const stiffness = 0.1; // Spring stiffness
        const damping = 0.8;   // Damping factor
        const mass = 1.0;      // Mass of the spring

        // Calculate spring force
        const displacement = targetRef.current - positionRef.current;
        const springForce = stiffness * displacement;
        
        // Calculate damping force
        const dampingForce = damping * velocityRef.current;
        
        // Calculate acceleration (F = ma)
        const acceleration = (springForce - dampingForce) / mass;
        
        // Update velocity and position using Verlet integration
        velocityRef.current += acceleration * deltaTime;
        positionRef.current += velocityRef.current * deltaTime;

        // Check if we're close enough to target to stop
        const isCloseEnough = Math.abs(displacement) < 0.01 && Math.abs(velocityRef.current) < 0.01;
        
        if (isCloseEnough) {
          // Settle to exact target
          positionRef.current = targetRef.current;
          velocityRef.current = 0;
          setAnimatedPrice(targetRef.current);
          if (onPriceUpdate) {
            onPriceUpdate(targetRef.current);
          }
          setIsAnimating(false);
          animationRef.current = null;
        } else {
          // Continue animation
          setAnimatedPrice(positionRef.current);
          if (onPriceUpdate) {
            onPriceUpdate(positionRef.current);
          }
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      setIsAnimating(true);
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

// Exponential ease-out function
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

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

  // Buffer for delayed path animation
  const [delayedPathData, setDelayedPathData] = useState<PricePoint[]>([]);
  const [delayedPathProgress, setDelayedPathProgress] = useState(0);
  const [isAnimatingDelayedPath, setIsAnimatingDelayedPath] = useState(false);
  const lastUpdateTimeRef = useRef<number>(0);

  // Monitor for new data points and animate segments
  useEffect(() => {
    if (!priceData || priceData.length < 2) return;
    
    const currentLength = priceData.length;
    const now = performance.now();
      
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
      const duration = CHART_ANIMATION.LINE_DRAW_DURATION;
      
      const animateSegment = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use cubic-bezier for smoother animation
        // Parameters optimized for extra smooth drawing (0.25, 0.05, 0.1, 1.0)
        // These parameters create a more gradual start and smoother finish
        const easedProgress = cubicBezier(0.25, 0.05, 0.1, 1.0, progress);
        
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

    // Handle delayed path animation
    if (now - lastUpdateTimeRef.current >= CHART_ANIMATION.DELAYED_PATH.UPDATE_INTERVAL) {
      lastUpdateTimeRef.current = now;

      // Get the last BUFFER_SIZE points from the current data
      const newDelayedData = priceData.slice(-CHART_ANIMATION.DELAYED_PATH.BUFFER_SIZE);
      
      // Start new delayed path animation
      setDelayedPathData(newDelayedData);
      setDelayedPathProgress(0);
      setIsAnimatingDelayedPath(true);

      const startTime = now;
      const duration = CHART_ANIMATION.DELAYED_PATH.DRAW_DURATION;

      const animateDelayedPath = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use cubic-bezier for smoother animation
        // Parameters optimized for extra smooth drawing (0.4, 0.0, 0.2, 1.0)
        const easedProgress = cubicBezier(0.4, 0.0, 0.2, 1.0, progress);
        
        // Update the delayed path progress
        setDelayedPathProgress(easedProgress);
        
        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animateDelayedPath);
        } else {
          // Animation complete
          setDelayedPathProgress(1.0);
          setIsAnimatingDelayedPath(false);
          animationRef.current = null;
        }
      };

      // Start the delayed path animation
      animationRef.current = requestAnimationFrame(animateDelayedPath);
    }
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
    lastTwoPoints: lastTwoPointsRef.current,
    // Delayed path animation state
    delayedPathData,
    delayedPathProgress,
    isAnimatingDelayedPath
  };
};

// Custom easing function for smooth animation
function easeInOutCubic(x: number): number {
  // Using a more sophisticated easing function for smoother animation
  return x < 0.5
    ? 4 * x * x * x
    : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Custom easing function for even smoother animation
function easeInOutQuart(x: number): number {
  return x < 0.5
    ? 8 * x * x * x * x
    : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

// Custom easing function for the smoothest animation
function easeInOutQuint(x: number): number {
  return x < 0.5
    ? 16 * x * x * x * x * x
    : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

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