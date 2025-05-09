"use client";

import React, { useRef } from 'react';

interface PricePathIndicatorProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  strokeWidth: number;
  darkMode: boolean;
  isAnimatingNewSegment: boolean;
}

export const PricePathIndicator: React.FC<PricePathIndicatorProps> = ({
  x,
  y,
  radius,
  color,
  glowColor,
  strokeWidth,
  darkMode,
  isAnimatingNewSegment,
}) => {
  const circleRef = useRef<SVGCircleElement | null>(null);

  return (
    <circle
      data-testid="indicator-circle"
      ref={circleRef}
      cx={x}
      cy={y}
      r={radius}
      fill={"#fff"}
      stroke={darkMode ? "#000" : "#fff"}
      strokeWidth={strokeWidth * 0.7}
      style={{
        filter: `drop-shadow(0 0 8px ${glowColor})`,
        transition: isAnimatingNewSegment
          ? "none" // Disable transition during segment animation for precise movement
          : "fill 0.1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.1s cubic-bezier(0.16, 1, 0.3, 1), cx 0.1s cubic-bezier(0.16, 1, 0.3, 1), cy 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        transform: "translateZ(0)", // Force GPU acceleration
      }}
    />
  );
};