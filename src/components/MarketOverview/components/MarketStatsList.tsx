"use client";

import React from 'react';
import { MarketStat } from './MarketStat';
import { MarketData } from '@/types/market';

interface MarketStatsListProps {
  marketData: MarketData;
}

const formatNumber = (num: number, decimals: number = 2) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatPercentage = (value: number | null) => {
  if (value === null) return '--';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const MarketStatsList: React.FC<MarketStatsListProps> = ({ marketData }) => {
  const marketStats = [
    { 
      label: 'Price', 
      value: formatNumber(marketData.price),
      className: 'text-xl font-bold gradient-text'
    },
    { 
      label: '24h Change', 
      value: formatPercentage(marketData.priceChangePercent),
      className: `price-change ${marketData.priceChangePercent && marketData.priceChangePercent >= 0 ? 'positive' : 'negative'}`
    },
    { 
      label: '24h High', 
      value: formatNumber(marketData.highPrice),
      className: 'text-green-500'
    },
    { 
      label: '24h Low', 
      value: formatNumber(marketData.lowPrice),
      className: 'text-red-500'
    },
    { 
      label: '24h Volume', 
      value: formatNumber(marketData.volume),
      className: 'text-gray-200'
    },
    { 
      label: 'Market Cap', 
      value: formatNumber(marketData.marketCap),
      className: 'text-gray-200'
    },
    { 
      label: 'Market Dominance', 
      value: marketData.dominance ? `${marketData.dominance.toFixed(2)}%` : '--',
      className: 'text-gray-200'
    },
    { 
      label: 'Circulating Supply', 
      value: formatNumber(marketData.circulatingSupply, 0),
      className: 'text-gray-200'
    },
    { 
      label: 'Total Supply', 
      value: formatNumber(marketData.totalSupply, 0),
      className: 'text-gray-200'
    },
    { 
      label: 'Max Supply', 
      value: formatNumber(marketData.maxSupply, 0),
      className: 'text-gray-200'
    },
  ];

  return (
    <div className="space-y-4">
      {marketStats.map((stat, index) => (
        <div 
          key={stat.label}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <MarketStat
            label={stat.label}
            value={stat.value}
            className={stat.className}
          />
        </div>
      ))}
    </div>
  );
}; 