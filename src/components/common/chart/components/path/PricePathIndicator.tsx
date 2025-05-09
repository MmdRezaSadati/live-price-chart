"use client";

import React from "react";
import { animated, SpringValue } from "@react-spring/web";

interface PricePathIndicatorProps {
  x: SpringValue<number>;
  y: SpringValue<number>;
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
  return (
    <>
      {/* Glow effect */}
      <animated.circle
        cx={x}
        cy={y}
        r={radius * 2}
        fill={glowColor}
        opacity={0.3}
        filter="url(#glow)"
      />

      {/* Main circle */}
      <animated.circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        stroke={darkMode ? "white" : "black"}
        strokeWidth={strokeWidth}
      />
    </>
  );
};
