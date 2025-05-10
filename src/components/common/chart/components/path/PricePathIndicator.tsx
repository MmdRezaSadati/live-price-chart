"use client";

import React from "react";
import { animated, SpringValue, useSpring } from "@react-spring/web";

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
  const delayedSpring = useSpring({
    from: { x: x.get() },
    to: { x: x.get() - 10 },
    delay: 100,
    config: {
      tension: 50,
      friction: 15,
    },
  });

  return (
    <>
      {/* Glow effect */}
      <animated.circle
        cx={delayedSpring.x}
        cy={y}
        r={radius * 2}
        fill={glowColor}
        opacity={0.3}
        filter="url(#glow)"
      />

      {/* Main circle */}
      <animated.circle
        cx={delayedSpring.x}
        cy={y}
        r={radius}
        fill={color}
        stroke={darkMode ? "white" : "black"}
        strokeWidth={strokeWidth}
      />
    </>
  );
};
