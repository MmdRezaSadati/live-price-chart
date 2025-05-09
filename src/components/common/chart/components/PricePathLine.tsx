"use client";

import React, { useRef, useEffect } from 'react';
import { PricePoint } from '../../../../types/chart';
import { D3ScaleFunction } from '../../../../types/chart';
import { COLORS } from '@/constants/chart';

interface PricePathLineProps {
  linePath: string;
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
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    try {
      // Get total path length
      const totalLength = pathRef.current.getTotalLength();

      // Set up path animation with optimized timing and easing
      pathRef.current.style.transition = `
        stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
        stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        stroke-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
        filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)
      `;
      pathRef.current.style.strokeDasharray = `${totalLength}`;
      pathRef.current.style.willChange = 'stroke-dashoffset, stroke, stroke-width, filter';
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error calculating path points:', error);
      }
    }
  }, [linePath]);

  return (
    <path
      data-testid="price-path"
      ref={pathRef}
      d={linePath}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      style={{
        filter: `drop-shadow(0 12px 24px ${glowColor})`,
        transition: `
          stroke-dashoffset 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          stroke 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          stroke-width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)
        `,
        willChange: 'stroke-dashoffset, stroke, stroke-width, filter',
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};