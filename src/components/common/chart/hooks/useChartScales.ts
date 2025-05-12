import * as d3 from 'd3';
import { MAX_DATA_POINTS } from '@/constants/chart';

interface ChartScales {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  innerWidth: number;
  innerHeight: number;
}

export const useChartScales = (
  width: number,
  height: number,
  priceData: number[]
): ChartScales => {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate y domain with padding
  const min = d3.min(priceData) ?? 0;
  const max = d3.max(priceData) ?? 0;
  const padding = (max - min) * 0.15 || 1;
  const yDomainMin = min - padding;
  const yDomainMax = max + padding;

  // Create scales
  const xScale = d3
    .scaleLinear()
    .domain([0, MAX_DATA_POINTS - 1])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([yDomainMin, yDomainMax])
    .range([innerHeight, 0]);

  return {
    xScale,
    yScale,
    innerWidth,
    innerHeight
  };
}; 