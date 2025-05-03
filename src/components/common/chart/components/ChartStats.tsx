"use client";

import { ChartStatsProps } from "../../../../types/chart";
import { CHART_STATS, COLORS as colors } from "../../../../constants/chart";

/**
 * Bottom statistics panel component
 * Displays market data and live indicator
 */
export const ChartStats = ({ fontSize, padding }: ChartStatsProps) => {
  return (
    <div
      className="absolute left-0 right-0 flex justify-between"
      style={{
        bottom: `${padding.y}px`,
        padding: `0 ${padding.x}px`,
      }}
    >
      {/* Market statistics */}
      <div className="flex gap-3 md:gap-6">
        {CHART_STATS.map((stat, i) => (
          <div key={i} className="flex flex-col">
            <span
              className="opacity-70"
              style={{ color: colors.text, fontSize: `${fontSize.labels}px` }}
            >
              {stat.label}
            </span>
            <span
              className="font-medium"
              style={{ color: colors.text, fontSize: `${fontSize.small}px` }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Live indicator */}
      <div
        className="flex items-center opacity-70"
        style={{ color: colors.text, fontSize: `${fontSize.labels}px` }}
      >
        <span>LIVE</span>
        <div className="ml-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
    </div>
  );
};
