"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "@/assets/styles/LivePriceChart.module.css";
import { useWebSocket } from "../../hooks/useWebSocket";
import { Tooltip } from "../common/Tooltip/Tooltip";
import {
  createChartScales,
  createGradients,
  ChartDimensions,
} from "../../utils/chartSetup";
import { setupChartElements, setupTooltipHandlers } from "./ChartSetup";
import { initializeChartData, fetchInitialChartData } from "./ChartAnimation";


const LivePriceChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
  } | null>(null);
  const priceHistoryRef = useRef<number[]>([]);
  const initialPriceRef = useRef<number | null>(null);

  const handlePriceUpdate = (price: number) => {
    // Set initial price if not set
    if (!initialPriceRef.current) {
      initialPriceRef.current = price;
    }

    // Only update price change direction
    if (priceHistoryRef.current.length >= 2) {
      const currentPrice =
        priceHistoryRef.current[priceHistoryRef.current.length - 1];
      setPriceChange(
        getPriceChangeDirection(currentPrice) === "up"
          ? "up"
          : getPriceChangeDirection(currentPrice) === "down"
            ? "down"
            : null
      );
    }
  };

  const getPriceChangeDirection = (currentPrice: number) => {
    if (!initialPriceRef.current) return "neutral";
    return currentPrice > initialPriceRef.current ? "up" : "down";
  };

  const { getPriceQueue } = useWebSocket({ onPriceUpdate: handlePriceUpdate });

  useEffect(() => {
    if (!svgRef.current) return;

    const n = 40;
    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 60, bottom: 30, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    svgRef.current.innerHTML = "";

    const dimensions: ChartDimensions = { width, height, margin };
    const { x, y } = createChartScales(dimensions, n);
    
    // Setup chart gradients
    createGradients(svg);
    
    // Setup chart elements (axes, grid, etc.)
    const { lineGroup, latestPointCircle } = setupChartElements({
      svg,
      dimensions,
      x,
      y
    });
    
    // Setup data and animation
    let data: number[] = [];
    
    const initChart = () => {
      // Initialize chart data and animation
      initializeChartData({
        lineGroup,
        latestPointCircle,
        x,
        y,
        priceHistoryRef,
        getPriceQueue,
        getPriceChangeDirection,
        n
      });
      
      // Initialize data for tooltip
      data = [...priceHistoryRef.current];
    };
    
    // Fetch initial data
    fetchInitialChartData(
      n,
      priceHistoryRef,
      setLoading,
      setError,
      initChart
    );
    
    // Setup tooltip handlers
    setupTooltipHandlers(svg, dimensions, x, y, data, setTooltip);
    
  }, []);

  return (
    <div
      className={styles.chartWrapper}
    >
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      <svg
        ref={svgRef}
        width={900}
        height={500}
        className={loading ? "hidden" : "block w-full h-full"}
      />
      {tooltip && <Tooltip {...tooltip} />}
    </div>
  );
};

export default LivePriceChart;
