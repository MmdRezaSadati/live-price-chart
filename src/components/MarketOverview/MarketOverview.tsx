"use client";

import React from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { MarketStatsList } from './components/MarketStatsList';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

const formatNumber = (num: number, decimals: number = 2) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatPercentage = (num: number) => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

export const MarketOverview = () => {
  const { marketData, isLoading, error } = useMarketData();

  return (
    <div className="rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 h-[calc(100vh-220px)] md:h-[calc(100vh-240px)] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-yellow-500">Market Overview</h2>
      
      {isLoading && <LoadingState />}
      {error && <ErrorState />}
      {marketData && <MarketStatsList marketData={marketData} />}
      
      {marketData && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(marketData.lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}; 