"use client";

import React, { useRef, useEffect } from "react";
import { ChartHeaderProps } from "../types/chart";
import { COLORS as colors } from "@/constants/chart";

const ChartHeader = ({
  price,
  priceColor,
  glowColor,
  priceChange,
  priceChangeValue,
  isPositiveChange,
  fontSize,
  iconSize,
  padding,
  headerHeight,
}: ChartHeaderProps) => {
  const priceDisplayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (priceDisplayRef.current) {
      priceDisplayRef.current.style.color = priceColor;
    }
  }, [priceColor]);

  return (
    <div
      data-testid="chart-header"
      className="absolute top-0 left-0 right-0 flex justify-between items-center z-10 transition-all duration-300"
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
        padding: `${padding.y}px ${padding.x}px`,
        height: `${headerHeight}px`,
      }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div
          className="rounded-full flex items-center justify-center transform hover:scale-105 transition-transform duration-200 cursor-pointer group"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, #fbbf24)`,
            boxShadow: `0 0 20px rgba(252, 211, 77, 0.6)`,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
        >
          <span
            className="text-black font-bold transform group-hover:scale-110 transition-transform duration-200"
            style={{ fontSize: `${fontSize.title * 0.9}px` }}
          >
            ₿
          </span>
        </div>
        <div>
          <h2
            className="font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
            style={{ fontSize: `${fontSize.title}px` }}
          >
            Bitcoin
          </h2>
          <div className="flex items-center gap-3">
          <p
              className="opacity-80 flex items-center gap-2"
            style={{ color: colors.text, fontSize: `${fontSize.small}px` }}
          >
              <span className="font-medium">BTCUSDT</span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1"></span>
                Live Chart
              </span>
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <button className="px-2 py-1 text-xs rounded-md bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 transition-colors duration-200">
                1H
              </button>
              <button className="px-2 py-1 text-xs rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                1D
              </button>
              <button className="px-2 py-1 text-xs rounded-md bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 transition-colors duration-200">
                1W
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div
          ref={priceDisplayRef}
          className="font-mono font-bold transform transition-all duration-300 hover:scale-105"
          style={{
            color: priceColor,
            textShadow: `0 0 15px ${glowColor}`,
            fontSize: `${fontSize.price}px`,
          }}
        >
          ${price}
        </div>
        <div className="flex items-center gap-2">
        <div
          style={{
            color: isPositiveChange ? colors.up : colors.down,
            fontSize: `${fontSize.small}px`,
          }}
            className="font-medium flex items-center gap-1"
        >
            <span className="transform transition-transform duration-300">
              {isPositiveChange ? "▲" : "▼"}
            </span>
            <span className="animate-fade-in">{priceChange}%</span>
          <span
            className="ml-1 opacity-70"
            style={{
              color: colors.text,
              fontSize: `${fontSize.small * 0.9}px`,
            }}
          >
            (${Math.abs(priceChangeValue).toFixed(2)})
          </span>
          </div>
          <button className="p-1 rounded-md hover:bg-gray-800/50 transition-colors duration-200">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartHeader; 