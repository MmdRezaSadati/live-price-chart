import React from 'react';
import ChartContainer from '../components/ChartContainer/ChartContainer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 bg-black text-white">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 text-[#fcd34d]">Bitcoin Live Trading</h1>
        <p className="text-sm sm:text-base text-gray-400">
          Real-time price data with advanced visualization
        </p>
      </header>

      <div className="flex-grow w-full h-[calc(100vh-150px)] md:h-[calc(100vh-180px)]">
        <div
          id="chart-container"
          className="w-full h-full rounded-xl overflow-hidden bg-[#0f172a] p-2 sm:p-4"
        >
          <ChartContainer />
        </div>
      </div>

      <footer className="mt-4 py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
        <p>Powered by Binance WebSocket API • All prices shown in USD</p>
      </footer>
    </div>
  );
}
