"use client";

import React from 'react';
import { MarketStat } from './MarketStat';
import { MarketData } from '@/types/market';

interface MarketStatsListProps {
  marketData: MarketData;
}

const formatNumber = (num: number | undefined, decimals: number = 2) => {
  if (num === undefined) return '--';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatPercentage = (num: number | undefined) => {
  if (num === undefined) return '--';
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

export const MarketStatsList: React.FC<MarketStatsListProps> = ({ marketData }) => {
  const marketStats = [
    { label: 'Price', value: formatNumber(marketData.price) },
    { 
      label: '24h Change', 
      value: formatPercentage(marketData.priceChangePercent),
      className: marketData.priceChangePercent && marketData.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
    },
    { label: '24h High', value: formatNumber(marketData.highPrice) },
    { label: '24h Low', value: formatNumber(marketData.lowPrice) },
    { label: '24h Volume', value: formatNumber(marketData.volume) },
    { label: 'Market Cap', value: formatNumber(marketData.marketCap) },
    { 
      label: 'Market Dominance', 
      value: marketData.dominance ? `${marketData.dominance.toFixed(2)}%` : '--'
    },
    { label: 'Circulating Supply', value: formatNumber(marketData.circulatingSupply, 0) },
    { label: 'Total Supply', value: formatNumber(marketData.totalSupply, 0) },
    { label: 'Max Supply', value: formatNumber(marketData.maxSupply, 0) },
  ];

  return (
    <div className="space-y-4">
      {marketStats.map((stat) => (
        <MarketStat
          key={stat.label}
          label={stat.label}
          value={stat.value}
          className={stat.className}
        />
      ))}
    </div>
  );
}; 