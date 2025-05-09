"use client";

import { MAX_DATA_POINTS } from "@/constants/chart";
import { PricePoint } from "@/types/chart";
import { useCallback, useEffect, useRef, useState } from "react";

// Number of initial price points to collect before showing the chart
const INITIAL_PRICE_BUFFER_SIZE = 70;

/**
 * Custom hook for managing WebSocket connection with Binance
 * Handles connection, data throttling, heartbeat, and cleanup
 *
 * @param onPriceUpdate Callback function that receives the new price
 * @returns State and data related to the WebSocket connection
 */
export const useWebSocket = (onPriceUpdate: (price: number) => void) => {
  // State for storing price data and metadata
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isNewPoint, setIsNewPoint] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangeValue, setPriceChangeValue] = useState(0);

  // Refs to persist across renders
  const socketRef = useRef<WebSocket | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const initialPriceRef = useRef<number | null>(null);
  const initialPriceBuffer = useRef<PricePoint[]>([]);
  const lastAdditionRef = useRef<number>(0);

  // Calculate percentage and absolute change since initial price
  const updateMetrics = useCallback((newPrice: number) => {
    const last = lastPriceRef.current;
    lastPriceRef.current = newPrice;
    if (last === null) {
      initialPriceRef.current = newPrice;
      return;
    }
    if (initialPriceRef.current !== null) {
      const delta = newPrice - initialPriceRef.current;
      setPriceChangeValue(delta);
      setPriceChange((delta / initialPriceRef.current) * 100);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let latestPrice: number | null = null;
    let latestTimestamp: number | null = null;
    let throttleTimer: NodeJS.Timeout;

    const symbol = process.env.NEXT_PUBLIC_BITCOIN_SYMBOL ?? "btcusdt";
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    socketRef.current = ws;

    const processPoint = (price: number, timestamp: number) => {
      const point: PricePoint = { price, timestamp };
      updateMetrics(price);
      setCurrentPrice(price);

      // Buffering for initial load
      if (isLoading) {
        const last = initialPriceBuffer.current[initialPriceBuffer.current.length - 1];
        if (!last || Math.abs(price - last.price) > 0.5 || timestamp - last.timestamp > 100) {
          initialPriceBuffer.current.push(point);
          setLoadingProgress(
            Math.min(1, initialPriceBuffer.current.length / INITIAL_PRICE_BUFFER_SIZE)
          );
          if (initialPriceBuffer.current.length >= INITIAL_PRICE_BUFFER_SIZE) {
            const sorted = [...initialPriceBuffer.current].sort((a, b) => a.timestamp - b.timestamp);
            setPriceData(sorted.slice(-MAX_DATA_POINTS));
            setIsLoading(false);
          }
        }
        return;
      }

      // Throttled updates after load
      const now = Date.now();
      if (now - lastAdditionRef.current > 200) {
        setPriceData((prev) => {
          const updated = [...prev, point];
          setIsNewPoint(true);
          lastAdditionRef.current = now;
          return updated.length > MAX_DATA_POINTS ? updated.slice(-MAX_DATA_POINTS) : updated;
        });
      }
    };

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      // Throttle loop
      throttleTimer = setInterval(() => {
        if (latestPrice !== null && latestTimestamp !== null) {
          processPoint(latestPrice, latestTimestamp);
        }
      }, 200);
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      latestPrice = parseFloat(msg.p);
      latestTimestamp = msg.T;
    };

    ws.onerror = (e) => {
      console.error("WebSocket error", e);
      setError(new Error("WebSocket encountered an error"));
      setIsConnected(false);
      clearInterval(throttleTimer);
    };

    ws.onclose = (ev) => {
      console.warn("WebSocket closed", ev.code, ev.reason);
      setIsConnected(false);
      clearInterval(throttleTimer);
    };

    // Cleanup on unmount
    return () => {
      clearInterval(throttleTimer);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [updateMetrics, isLoading]);

  // Notify parent of price updates
  useEffect(() => {
    if (currentPrice !== null) onPriceUpdate(currentPrice);
  }, [currentPrice, onPriceUpdate]);

  return {
    priceData,
    currentPrice,
    isNewPoint,
    setIsNewPoint,
    priceChange,
    priceChangeValue,
    lastPriceRef,
    initialPriceRef,
    isConnected,
    error,
    isLoading,
    loadingProgress,
    ws: socketRef.current,
  };
};
