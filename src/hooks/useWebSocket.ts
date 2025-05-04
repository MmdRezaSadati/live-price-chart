"use client";

import { BITCOIN_SYMBOL, MAX_DATA_POINTS } from "@/constants/chart";
import { PricePoint } from "@/types/chart";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing WebSocket connection with Binance
 * Handles connection, data throttling, and cleanup
 *
 * @param onPriceUpdate Callback function that receives the new price
 * @returns State and data related to the WebSocket connection
 */
export const useWebSocket = (onPriceUpdate: (price: number) => void) => {
  // State for storing price data
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isNewPoint, setIsNewPoint] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track initial price for calculating change
  const initialPriceRef = useRef<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangeValue, setPriceChangeValue] = useState<number>(0);

  // References for WebSocket and last price
  const socketRef = useRef<WebSocket | null>(null);
  const isInitialMount = useRef(true);
  const lastPointRef = useRef<PricePoint | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  /**
   * Process new price data and calculate changes
   *
   * @param newPrice Latest price from WebSocket
   */
  const setChartColorEverywhere = useCallback((newPrice: number) => {
    // Always update last price first
    const lastPrice = lastPriceRef.current;
    lastPriceRef.current = newPrice;

    if (lastPrice === null) {
      // First price - save as initial
      initialPriceRef.current = newPrice;
      return;
    }

    // Calculate price change percentage since session start
    if (initialPriceRef.current !== null) {
      const changeValue = newPrice - initialPriceRef.current;
      const changePercent = (changeValue / initialPriceRef.current) * 100;
      setPriceChange(changePercent);
      setPriceChangeValue(changeValue);
    }
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server-side

    // Only establish connection if it's the initial mount or we need to reconnect
    if (!isInitialMount.current && socketRef.current) {
      return;
    }

    // Close previous connection if it exists
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Variables for throttling data updates
    let latestPrice: number | null = null;
    let latestTimestamp: number | null = null;
    let throttleTimer: NodeJS.Timeout | null = null;

    // Set up regular updates with throttling
    const setupRegularUpdates = () => {
      if (throttleTimer) {
        clearInterval(throttleTimer);
      }

      throttleTimer = setInterval(() => {
        if (latestPrice !== null && latestTimestamp !== null) {
          updatePriceData(latestPrice, latestTimestamp);
        }
      }, 200); // Update every 200ms at most
    };

    // Process incoming price data
    const updatePriceData = (price: number, timestamp: number) => {
      lastPointRef.current = { timestamp, price };
      setChartColorEverywhere(price);
      setCurrentPrice(price);
      lastUpdateTimeRef.current = Date.now();

      // Update the price data array
      setPriceData((prevData) => {
        const newData = [...prevData, { timestamp, price }];
        setIsNewPoint(true);
        return newData.length > MAX_DATA_POINTS
          ? newData.slice(-MAX_DATA_POINTS)
          : newData;
      });
    };

    // Connect to Binance WebSocket
    try {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${BITCOIN_SYMBOL}@trade`
      );

      ws.onopen = () => {
        console.log("Connection established with Binance Bitcoin feed");
        setIsConnected(true);
        setError(null);
        setupRegularUpdates();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p);
        const timestamp = data.T;

        // Store latest values for throttled updates
        latestPrice = newPrice;
        latestTimestamp = timestamp;
      };

      ws.onerror = (event: Event) => {
        console.error("WebSocket error:", event);
        setError(new Error("WebSocket encountered an error"));
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("Connection closed");
        setIsConnected(false);
        if (throttleTimer) {
          clearInterval(throttleTimer);
        }
      };

      socketRef.current = ws;
      isInitialMount.current = false;
    } catch (e: unknown) {
      console.error("Error connecting to WebSocket:", e);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error(String(e)));
      }
      setIsConnected(false);
    }

    // Cleanup on unmount
    return () => {
      if (throttleTimer) {
        clearInterval(throttleTimer);
      }
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
    };
  }, [setChartColorEverywhere]);

  // Call the onPriceUpdate callback when price changes
  useEffect(() => {
    if (currentPrice !== null) {
      onPriceUpdate(currentPrice);
    }
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
    ws: socketRef.current
  };
};
