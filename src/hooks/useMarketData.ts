"use client";

import { useEffect, useState } from 'react';
import { MarketData } from '@/types/market';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch 24hr ticker data
        const tickerResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const tickerData = await tickerResponse.json();

        // Fetch current price
        const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const priceData = await priceResponse.json();

        // Fetch market cap and supply data from CoinGecko
        const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false');
        const coingeckoData = await coingeckoResponse.json();

        const data: MarketData = {
          price: parseFloat(priceData.price),
          priceChange: parseFloat(tickerData.priceChange),
          priceChangePercent: parseFloat(tickerData.priceChangePercent),
          highPrice: parseFloat(tickerData.highPrice),
          lowPrice: parseFloat(tickerData.lowPrice),
          volume: parseFloat(tickerData.volume),
          quoteVolume: parseFloat(tickerData.quoteVolume),
          marketCap: coingeckoData.market_data.market_cap.usd,
          dominance: coingeckoData.market_data.market_cap_dominance,
          circulatingSupply: coingeckoData.market_data.circulating_supply,
          totalSupply: coingeckoData.market_data.total_supply,
          maxSupply: coingeckoData.market_data.max_supply,
          lastUpdate: Date.now()
        };

        setMarketData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { marketData, isLoading, error };
}; 