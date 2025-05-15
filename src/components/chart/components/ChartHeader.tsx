"use client";

import React from 'react';
import { RefreshButton } from '../../common/RefreshButton/RefreshButton';

interface ChartHeaderProps {
  title: string;
  description: string;
  isLive: boolean;
  onRefresh: () => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  description,
  isLive,
  onRefresh
}) => {
  return (
    <header className="px-4 py-6 sm:px-6 lg:px-8 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-gradient">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-gray-300">Live Data</span>
            </div>
            <RefreshButton onRefresh={onRefresh} />
          </div>
        </div>
      </div>
    </header>
  );
}; 