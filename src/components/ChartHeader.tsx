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
      className="absolute top-0 left-0 right-0 flex justify-between items-center z-10"
      style={{
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        padding: `${padding.y}px ${padding.x}px`,
        height: `${headerHeight}px`,
      }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            background: colors.accent,
            boxShadow: "0 0 15px rgba(252, 211, 77, 0.5)",
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
        >
          <span
            className="text-black font-bold"
            style={{ fontSize: `${fontSize.title * 0.9}px` }}
          >
            ₿
          </span>
        </div>
        <div>
          <h2
            className="font-bold"
            style={{ color: colors.accent, fontSize: `${fontSize.title}px` }}
          >
            Bitcoin
          </h2>
          <p
            className="opacity-80"
            style={{ color: colors.text, fontSize: `${fontSize.small}px` }}
          >
            BTCUSDT • Live Chart
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div
          ref={priceDisplayRef}
          className="font-mono font-bold"
          style={{
            color: priceColor,
            textShadow: `0 0 10px ${glowColor}`,
            fontSize: `${fontSize.price}px`,
          }}
        >
          ${price}
        </div>
        <div
          style={{
            color: isPositiveChange ? colors.up : colors.down,
            fontSize: `${fontSize.small}px`,
          }}
          className="font-medium"
        >
          {isPositiveChange ? "▲" : "▼"} {priceChange}%
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
      </div>
    </div>
  );
};

export default ChartHeader; 