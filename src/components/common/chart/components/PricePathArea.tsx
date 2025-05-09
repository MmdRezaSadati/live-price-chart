"use client";

import React from 'react';

interface PricePathAreaProps {
  areaPath: string;
  fillColor: string;
}

export const PricePathArea: React.FC<PricePathAreaProps> = ({
  areaPath,
  fillColor,
}) => {
  return (
    <>
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <path
        data-testid="price-area"
        d={areaPath}
        fill="url(#areaGradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'fill 1s cubic-bezier(0.4, 0.1, 0.3, 1)',
        }}
      />
    </>
  );
};