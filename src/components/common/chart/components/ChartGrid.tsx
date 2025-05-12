"use client";

import React from 'react';

// Accept any props for now to resolve type errors
interface ChartGridProps {
  [key: string]: any;
}

export const ChartGrid: React.FC<ChartGridProps> = (props) => {
  // Placeholder: just render an empty group for now
  return <g />;
}; 