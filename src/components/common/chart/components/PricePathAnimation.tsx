"use client";

import React, { useRef } from 'react';

interface PricePathAnimationProps {
  animatedSegmentPath: string;
  delayedPath: string;
  color: string;
  glowColor: string;
  strokeWidth: number;
  isAnimatingNewSegment: boolean;
  isAnimatingDelayedPath: boolean;
}

export const PricePathAnimation: React.FC<PricePathAnimationProps> = ({
  animatedSegmentPath,
  delayedPath,
  color,
  glowColor,
  strokeWidth,
  isAnimatingNewSegment,
  isAnimatingDelayedPath,
}) => {
  const delayedPathRef = useRef<SVGPathElement | null>(null);

  return (
    <>
      {/* Delayed path */}
      {isAnimatingDelayedPath && (
        <path
          data-testid="delayed-path"
          ref={delayedPathRef}
          d={delayedPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{
            filter: `drop-shadow(0 12px 24px ${glowColor})`,
            opacity: 0.7,
            transition:
              'stroke 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Animated new segment - only shown during animation */}
      {isAnimatingNewSegment && (
        <path
          data-testid="animated-segment"
          d={animatedSegmentPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{
            filter: `drop-shadow(0 12px 24px ${glowColor})`,
            transition: 'stroke 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </>
  );
};