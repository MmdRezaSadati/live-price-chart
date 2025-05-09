"use client";

import React from "react";
import { animated, SpringValue } from "@react-spring/web";

interface PricePathLineProps {
  linePath: SpringValue<string>;
  color: string;
  glowColor: string;
  strokeWidth: number;
  priceChange: number;
}

export const PricePathLine: React.FC<PricePathLineProps> = ({
  linePath,
  color,
  glowColor,
  strokeWidth,
  priceChange,
}) => {
  return (
    <>
      {/* Glow effect */}
      <animated.path
        d={linePath}
        fill="none"
        stroke={glowColor}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        opacity={0.5}
      />

      {/* Main line */}
      <animated.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};
