"use client";

import React from 'react';

interface MarketStatProps {
  label: string;
  value: string;
  className?: string;
}

export const MarketStat: React.FC<MarketStatProps> = ({ label, value, className }) => {
  return (
    <div 
      className="market-stat hover-lift"
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className={`font-mono ${className || 'text-gray-200'}`}>{value}</span>
      </div>
    </div>
  );
}; 