import { ChartFooter } from '@/components/ChartContainer/components/ChartFooter';
import { RefreshHandler } from '@/components/ChartContainer/components/RefreshHandler';
import LivePriceChart from '@/components/common/chart/LivePriceChart';
import { MarketOverview } from '@/components/MarketOverview/MarketOverview';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <RefreshHandler
        title="Bitcoin Live Trading"
        description="Real-time price data with advanced visualization and market insights"
        isLive={true}
      />

      <main className="flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div
                id="chart-container"
                className="w-full h-[calc(100vh-220px)] md:h-[calc(100vh-240px)] rounded-2xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 shadow-2xl transition-all duration-300 hover:shadow-yellow-500/10 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LivePriceChart />
                {/* <ChartContainer /> */}
              </div>
            </div>
            <div className="lg:col-span-1">
              <MarketOverview />
            </div>
          </div>
        </div>
      </main>

      <ChartFooter
        lastUpdated={new Date().toLocaleTimeString()}
        isLive={true}
      />
    </div>
  );
}
