"use client";

import React from "react";
import { animated, SpringValue } from "@react-spring/web";

interface PricePathAreaProps {
  areaPath: SpringValue<string>;
  fillColor: string;
}

export const PricePathArea: React.FC<PricePathAreaProps> = ({
  areaPath,
  fillColor,
}) => {
  return (
    <animated.path
      d={areaPath}
      fill={fillColor}
      opacity={0.2}
      filter="url(#glow)"
    />
  );
};