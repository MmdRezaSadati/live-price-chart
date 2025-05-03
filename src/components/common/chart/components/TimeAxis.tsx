"use client";

import React from 'react';
import { COLORS } from '@/constants/chart';

interface TimeAxisProps {
  timeScale: any;  // D3 scale function
  width: number;
  height: number;
  padding: {
    x: number;
    y: number;
  };
  priceData: Array<{ timestamp: number; price: number }>;
  fontSize: {
    labels: number;
  };
}

/**
 * Renders a time axis at the bottom of the chart
 * to display time labels at regular intervals
 */
export const TimeAxis: React.FC<TimeAxisProps> = ({
  timeScale,
  width,
  height,
  padding,
  priceData,
  fontSize
}) => {
  if (!priceData || priceData.length < 2 || !timeScale) {
    return null;
  }

  // Calculate positions for time markers
  const timeLabels = [];
  const tickCount = 6; // Increased number of time labels to display

  // Calculate available width for placing labels
  const availableWidth = width - (padding.x * 2);
  const labelSpacing = availableWidth / (tickCount - 1);

  for (let i = 0; i < tickCount; i++) {
    // Get evenly distributed indices in the data array
    const index = Math.floor((priceData.length - 1) * (i / (tickCount - 1)));
    const dataPoint = priceData[index];
    
    if (dataPoint) {
      const x = padding.x + (labelSpacing * i);
      const y = height - padding.y / 2;
      
      // Format the timestamp with seconds
      const date = new Date(dataPoint.timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const timeLabel = `${hours}:${minutes}:${seconds}`;

      timeLabels.push(
        <g key={`time-label-${i}`} className="time-marker">
          {/* Tick mark */}
          <line
            x1={x}
            y1={height - padding.y}
            x2={x}
            y2={height - padding.y + 5}
            stroke={COLORS.gridText}
            strokeWidth={1}
          />
          
          {/* Time label */}
          <text
            x={x}
            y={y + 5}
            fill={COLORS.gridText}
            fontSize={fontSize.labels}
            textAnchor="middle"
            dominantBaseline="hanging"
            className="font-mono"
          >
            {timeLabel}
          </text>
        </g>
      );
    }
  }

  return (
    <g className="time-axis">
      {/* Horizontal axis line */}
      <line
        x1={padding.x}
        y1={height - padding.y}
        x2={width - padding.x}
        y2={height - padding.y}
        stroke={COLORS.grid}
        strokeWidth={1}
      />
      
      {/* Time labels */}
      {timeLabels}
    </g>
  );
}; 