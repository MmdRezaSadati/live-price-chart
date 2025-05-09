"use client";

import * as d3 from "d3";
import { interpolatePath } from "d3-interpolate-path";
import React, { useEffect, useRef } from "react";

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
     // We store the previous path value in a ref so we always have the actual previous path
      const prevPathRef = (pathRef.current as any)._prevPathRef || { current: "" };
      if (!(pathRef.current as any)._prevPathRef) {
        (pathRef.current as any)._prevPathRef = prevPathRef;
      }
      const oldPath = prevPathRef.current || "";
      prevPathRef.current = linePath;

      // Get total path length
      const totalLength = pathRef.current.getTotalLength();
      pathRef.current.style.transition = `
        stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
        stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        stroke-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
        filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)
      `;
      pathRef.current.style.strokeDasharray = `${totalLength}`;
      pathRef.current.style.willChange =
        "stroke-dashoffset, stroke, stroke-width, filter";

      // --- d3.interpolatePath animation ---
      const pathElement = d3.select(pathRef.current);
      pathElement
        .transition()
        .duration(30)
        .attrTween("d", function () {
          const interpolator = interpolatePath(oldPath, linePath);
          return function (t) {
            return interpolator(t);
          };
        });
      // --- End of animation ---
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error("Error calculating path points:", error);
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
        willChange: "stroke-dashoffset, stroke, stroke-width, filter",
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};
