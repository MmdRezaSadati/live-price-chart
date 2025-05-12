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
      className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200"
    >
      <span className="text-gray-400">{label}</span>
      <span className={`font-mono ${className || 'text-gray-200'}`}>{value}</span>
    </div>
  );
}; 