import React from "react";
import { COLORS } from "@/constants/chart";

interface ChartGridProps {
  priceData: any[];
  priceScale: (price: number) => number;
  width: number;
  padding: { x: number; y: number };
  fontSize: any;
  chartHeight: number;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  priceData,
  priceScale,
  width,
  padding,
  fontSize,
  chartHeight,
}) => {
  const gridLines = [];

  // Horizontal lines (price levels)
  for (let i = 0; i <= 5; i++) {
    const price =
      priceData.length > 0
        ? priceData[priceData.length - 1].price -
          priceData[priceData.length - 1].price * 0.002 +
          (i * (priceData[priceData.length - 1].price * 0.004)) / 4
        : 0;

    const y = priceScale(price);
    gridLines.push(
      <g key={`grid-${i}`} className="transition-all duration-700">
        <line
          data-testid="grid-line"
          x1={padding.x}
          y1={y}
          x2={width}
          y2={y}
          stroke={COLORS.grid}
          strokeDasharray="3,5"
          strokeWidth={1}
        />
        <text
          x={padding.x / 2}
          y={y - 6}
          fill={COLORS.gridText}
          fontSize={fontSize.labels}
          className="font-mono"
        >
          ${Math.round(price).toLocaleString()}
        </text>
      </g>
    );
  }

  // Vertical lines (time periods)
  for (let i = 0; i <= 4; i++) {
    const x = padding.x + (i / 4) * (width - padding.x * 2);
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={padding.y}
        x2={x}
        y2={chartHeight - padding.y * 3}
        stroke={COLORS.grid}
        strokeWidth="1"
      />
    );
  }

  return <>{gridLines}</>;
};