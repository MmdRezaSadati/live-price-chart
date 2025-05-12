import React from 'react';

interface ChartFooterProps {
  lastUpdated: string;
  isLive: boolean;
}

export const ChartFooter: React.FC<ChartFooterProps> = ({
  lastUpdated,
  isLive
}) => {
  return (
    <footer className="px-4 py-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            Powered by Binance WebSocket API
          </p>
          <span className="hidden sm:block text-gray-700">•</span>
          <p className="text-sm text-gray-500">
            All prices shown in USD
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}; 