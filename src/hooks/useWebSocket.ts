"use client";

import { MAX_DATA_POINTS } from "@/constants/chart";
import { PricePoint } from "@/types/chart";
import { useCallback, useEffect, useRef, useState } from "react";

// Number of initial price points to collect before showing the chart
const INITIAL_PRICE_BUFFER_SIZE = 20;

interface UseWebSocketProps {
  onPriceUpdate: (price: number) => void;
}

/**
 * Custom hook for managing WebSocket connection with Binance
 * Handles connection, data throttling, heartbeat, and cleanup
 *
 * @param onPriceUpdate Callback function that receives the new price
 * @returns State and data related to the WebSocket connection
 */
export const useWebSocket = ({ onPriceUpdate }: UseWebSocketProps) => {
  const [priceData, setPriceData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const priceQueueRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const lastPriceRef = useRef<number>(0);
  const isStoppedRef = useRef(false);
  const n = 40;

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=40');
        const klines = await response.json();
        const initialPrices = klines.map((d: any) => +d[4]); // close price
        setPriceData(initialPrices);
        setIsLoading(false);
        startWebSocket();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setIsLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startWebSocket = () => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      if (isStoppedRef.current) return;
      
      const msg = JSON.parse(event.data);
      const price = +msg.p;
      
      if (!isNaN(price)) {
        if (
          priceQueueRef.current.length === 0 ||
          Math.abs(price - priceQueueRef.current[priceQueueRef.current.length - 1]) >= 0.2
        ) {
          priceQueueRef.current.push(price);
          if (priceQueueRef.current.length > n) {
            priceQueueRef.current.shift();
          }
          onPriceUpdate(price);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const updatePrice = () => {
    if (isStoppedRef.current) return;
    
    const now = Date.now();
    const queue = priceQueueRef.current;
    
    if (queue.length > 0 && now - lastUpdateRef.current >= 300) {
      const newPrice = queue.shift();
      if (newPrice !== undefined) {
        lastPriceRef.current = newPrice;
        setPriceData(prev => {
          const newData = [...prev, newPrice];
          if (newData.length > 40) newData.shift();
          return newData;
        });
        lastUpdateRef.current = now;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(updatePrice, 300);
    return () => clearInterval(interval);
  }, []);

  const stopWebSocket = useCallback(() => {
    isStoppedRef.current = true;
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return {
    priceData,
    isLoading,
    lastPrice: lastPriceRef.current,
    stopWebSocket,
    getPriceQueue: () => priceQueueRef.current,
  };
};
