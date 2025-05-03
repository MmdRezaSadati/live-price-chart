"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Import LivePriceChart dynamically with loading state
const LivePriceChart = dynamic(() => import('../common/chart/LivePriceChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden bg-[#0f172a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#fcd34d transparent #fcd34d #fcd34d' }}>
        </div>
        <p className="text-base md:text-lg font-bold text-[#fcd34d]">Loading chart...</p>
      </div>
    </div>
  )
});

/**
 * Container component for the Bitcoin price chart
 * Handles responsive sizing and loading states
 */
export default function ChartContainer() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef) return;

    const updateDimensions = () => {
      if (containerRef) {
        setDimensions({
          width: containerRef.clientWidth,
          height: containerRef.clientHeight
        });
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef);

    // Clean up
    return () => {
      if (containerRef) {
        resizeObserver.unobserve(containerRef);
      }
    };
  }, [containerRef]);

  return (
    <div 
      ref={setContainerRef}
      className="w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
    >
      {dimensions.width > 0 && (
        <LivePriceChart 
          width={dimensions.width} 
          height={dimensions.height || Math.max(400, dimensions.width * 0.5)} 
        />
      )}
    </div>
  );
} 