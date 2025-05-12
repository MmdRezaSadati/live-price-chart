import * as d3 from 'd3';
import React from 'react';
import { useChartColors } from '../hooks/useChartColors';

interface ChartFiltersProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
}

export const ChartFilters: React.FC<ChartFiltersProps> = ({ svg }) => {
  const { colors, createGradient } = useChartColors();

  // Add defs for filters and gradients
  const defs = svg.append("defs");

  // Enhanced glow filter with multiple layers and colors
  const glowFilter = defs
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  // Primary glow with larger blur
  glowFilter
    .append("feGaussianBlur")
    .attr("stdDeviation", "8")
    .attr("result", "coloredBlur");

  // Secondary glow for extra depth
  glowFilter
    .append("feGaussianBlur")
    .attr("stdDeviation", "4")
    .attr("result", "coloredBlur2");

  // Add color matrix for enhanced glow effect
  glowFilter
    .append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
    .attr("result", "coloredBlur3");

  const feMerge = glowFilter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "coloredBlur2");
  feMerge.append("feMergeNode").attr("in", "coloredBlur3");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Add shadow filter for depth
  const shadowFilter = defs
    .append("filter")
    .attr("id", "shadow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  shadowFilter
    .append("feGaussianBlur")
    .attr("stdDeviation", "3")
    .attr("result", "shadowBlur");

  shadowFilter
    .append("feOffset")
    .attr("dx", "2")
    .attr("dy", "2")
    .attr("result", "shadowOffset");

  shadowFilter
    .append("feComposite")
    .attr("in", "shadowBlur")
    .attr("in2", "shadowOffset")
    .attr("operator", "over");

  // Create enhanced gradients with more color stops
  createGradient(defs, "area-gradient-up", colors.up.gradient);
  createGradient(defs, "area-gradient-down", colors.down.gradient);

  return null;
}; 