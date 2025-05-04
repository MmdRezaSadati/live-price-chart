"use client";

import { TimeRangeControlsProps } from "../../../../types/chart";
import { COLORS as colors, TIME_RANGES } from "../../../../constants/chart";

/**
 * Time range selector component
 * Allows users to switch between different time periods
 */
export const TimeRangeControls = ({
  selectedRange,
  onRangeChange,
  headerHeight,
  padding,
  fontSize,
}: TimeRangeControlsProps) => {
  return (
    <div
      data-testid="time-range-controls"
      className="absolute flex gap-1 md:gap-2 z-10"
      style={{
        top: `${headerHeight + padding.y}px`,
        right: `${padding.x}px`,
      }}
    >
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onRangeChange(range)}
          className={`px-2 py-0.5 rounded-full transition-all ${
            selectedRange === range ? "font-semibold" : "opacity-60"
          }`}
          style={{
            backgroundColor:
              selectedRange === range
                ? colors.accent
                : "rgba(100, 116, 139, 0.2)",
            color: selectedRange === range ? "#000" : colors.text,
            fontSize: `${fontSize.small}px`,
          }}
        >
          {range}
        </button>
      ))}
    </div>
  );
};
