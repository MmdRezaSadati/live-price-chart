"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./LivePriceChart.module.css";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Tooltip } from "./components/Tooltip";
import { createChartScales, createLineGenerator, createAreaGenerator, createGradients, ChartDimensions } from "./utils/chartSetup";

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

  const handlePriceUpdate = (price: number) => {
    // Only update price change direction
    if (priceHistoryRef.current.length >= 2) {
      const currentPrice = priceHistoryRef.current[priceHistoryRef.current.length - 1];
      const previousPrice = priceHistoryRef.current[priceHistoryRef.current.length - 2];
      setPriceChange(
        currentPrice > previousPrice
          ? "up"
          : currentPrice < previousPrice
            ? "down"
            : null
      );
    }
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
    const lineGenerator = createLineGenerator(x, y);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add grid
    g.append("g")
      .attr("class", styles.grid)
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      );

    g.append("g")
      .attr("class", styles.grid)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat(() => "")
      );

    // Add axes
    g.append("g")
      .attr("class", styles.axis)
      .call(d3.axisLeft(y));

    g.append("g")
      .attr("class", styles.axis)
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    createGradients(svg);

    g.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width + margin.right)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    const latestPointCircle = g
      .append("circle")
      .attr("r", 7)
      .style("fill", "#fff")
      .style("stroke", "white")
      .style("stroke-width", "3.5px");

    let data: number[] = [];
    let lastUpdate = 0;
    let linePath: d3.Selection<SVGPathElement, number[], null, undefined>;

    function updateYDomain() {
      const mean =
        priceHistoryRef.current.reduce((a, b) => a + b, 0) / priceHistoryRef.current.length;
      let min = mean * 0.9999;
      let max = mean * 1.0001;
      const realMin = Math.min(...priceHistoryRef.current);
      const realMax = Math.max(...priceHistoryRef.current);
      if (realMin < min) min = realMin;
      if (realMax > max) max = realMax;
      y.domain([min, max]);
      return { mean, min, max };
    }

    function initChart() {
      updateYDomain();
      data = [...priceHistoryRef.current];

      const path = lineGroup
        .append("path")
        .datum(data)
        .attr("class", styles.line)
        .attr("fill", "none")
        .attr("stroke", "#d7ed47")
        .attr("stroke-width", 3.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      linePath = path;
      
      path
        .transition()
        .duration(300)
        .ease(d3.easeLinear)
        .on("start", tick);

      const lastIdx = data.length - 1;
      latestPointCircle.attr("cx", x(lastIdx)).attr("cy", y(data[lastIdx]));
    }

    function tick(this: SVGPathElement) {
      const now = Date.now();
      let newData: number;

      if (getPriceQueue().length > 0 && now - lastUpdate >= 300) {
        const price = getPriceQueue().shift()!;
        priceHistoryRef.current.push(price);
        if (priceHistoryRef.current.length > n) priceHistoryRef.current.shift();
        updateYDomain();
        newData = price;
      } else {
        newData = data[data.length - 1];
      }

      data.push(newData);
      if (data.length > n) data.shift();

      // Update line path
      d3.select(this).attr("d", lineGenerator(data)).attr("transform", null);

      // Continue animation
      const active = d3.active(this);
      if (active) {
        active
          .attr("transform", `translate(${x(0)},0)`)
          .transition()
          .on("start", tick);
      }

      data.shift();

      // Update circle position
      const lastIdx = data.length - 1;
      const pathElement = d3.select(this).node();
      if (pathElement) {
        const lastX = x(lastIdx);
        const lastY = y(data[lastIdx]);
        
        latestPointCircle
          .transition()
          .duration(50)
          .ease(d3.easeLinear)
          .attr("cx", lastX + 15)
          .attr("cy", lastY);
      }
    }

    async function fetchInitialData() {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=${n}`
        );
        const klines = await response.json();
        priceHistoryRef.current = klines.map((d: any[]) => +d[4]);
        data = priceHistoryRef.current.map(() => 0);
        setLoading(false);
        initChart();
      } catch (err) {
        setError("Error fetching initial data!");
        setLoading(false);
      }
    }

    fetchInitialData();

    // Add tooltip logic
    svg.on("mousemove", function (event) {
      const [mx] = d3.pointer(event);
      const idx = Math.round(
        (mx - margin.left) / (width / (data.length - 1))
      );
      if (idx >= 0 && idx < data.length) {
        setTooltip({
          x: x(idx) + margin.left,
          y: y(data[idx]) + margin.top,
          value: data[idx],
        });
      } else {
        setTooltip(null);
      }
    });
    svg.on("mouseleave", function () {
      setTooltip(null);
    });
  }, []);

  return (
    <div className={styles.chartWrapper}>
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
 