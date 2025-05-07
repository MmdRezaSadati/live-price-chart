"use client";

import { BITCOIN_SYMBOL, MAX_DATA_POINTS } from "@/constants/chart";
import { PricePoint } from "@/types/chart";
import { useCallback, useEffect, useRef, useState } from "react";

// Number of initial price points to collect before showing the chart
const INITIAL_PRICE_BUFFER_SIZE = 100;

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
  const initialPriceBuffer = useRef<PricePoint[]>([]);
  
  // Use a throttled update to avoid too many re-renders
  const lastAdditionRef = useRef<number>(0);

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
      const newPoint = { timestamp, price };
      lastPointRef.current = newPoint;
      setChartColorEverywhere(price);
      setCurrentPrice(price);
      lastUpdateTimeRef.current = Date.now();

      // When in loading state, buffer the initial price points
      if (isLoading) {
        // Only add a point if it's sufficiently different from the last one
        // This prevents duplicate points that don't add visual information
        const lastPoint = initialPriceBuffer.current[initialPriceBuffer.current.length - 1];
        
        if (!lastPoint || Math.abs(price - lastPoint.price) > 0.5 || 
            timestamp - lastPoint.timestamp > 100) {
          initialPriceBuffer.current.push(newPoint);
          const progress = Math.min(1, initialPriceBuffer.current.length / INITIAL_PRICE_BUFFER_SIZE);
          setLoadingProgress(progress);
          
          // Once we've collected enough points, set them all at once and exit loading state
          if (initialPriceBuffer.current.length >= INITIAL_PRICE_BUFFER_SIZE) {
            // Sort by timestamp to ensure proper order
            const sortedData = [...initialPriceBuffer.current].sort((a, b) => a.timestamp - b.timestamp);
            
            // Set all data at once
            setPriceData(sortedData.slice(-MAX_DATA_POINTS));
            setIsLoading(false);
          }
          return;
        }
        return;
      }

      // Update the price data array once loading is complete
      // Only add a new point every 200ms to avoid too frequent updates
      const now = Date.now();
      if (now - lastAdditionRef.current > 200) {
        setPriceData((prevData) => {
          const newData = [...prevData, newPoint];
          setIsNewPoint(true);
          lastAdditionRef.current = now;
          return newData.length > MAX_DATA_POINTS
            ? newData.slice(-MAX_DATA_POINTS)
            : newData;
        });
      }
    };

    // Connect to Binance WebSocket
    try {
      // Set loading state when connecting
      setIsLoading(true);
      setLoadingProgress(0);
      initialPriceBuffer.current = [];
      
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
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log("Connection closed");
        setIsConnected(false);
        setIsLoading(false);
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
      setIsLoading(false);
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
  }, [setChartColorEverywhere, isLoading]);

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
    isLoading,
    loadingProgress,
    ws: socketRef.current
  };
}; 