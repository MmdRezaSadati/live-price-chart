"use client";

import React from 'react';
import * as d3 from 'd3';

interface TimeAxisProps {
  width: number;
  height: number;
  x: number;
  y: number;
  data: number[];
  timeFormat?: string;
  timeScale?: any;
  padding?: any;
  priceData?: any;
  fontSize?: any;
}

export const TimeAxis: React.FC<TimeAxisProps> = ({
  width,
  height,
  x,
  y,
  data,
  timeFormat = '%H:%M:%S',
  timeScale
}) => {
  const scale = timeScale || d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width]);

  const timeAxis = d3.axisBottom(scale)
    .ticks(5)
    .tickFormat((d) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - (data.length - 1 - Number(d)));
      return d3.timeFormat(timeFormat)(date);
    });

  return (
    <g transform={`translate(${x},${y})`}>
      <g ref={(node) => {
        if (node) {
          d3.select(node).call(timeAxis);
        }
      }} />
    </g>
  );
}; 