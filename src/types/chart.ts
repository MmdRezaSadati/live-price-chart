export interface ChartHeaderProps {
  price: number;
  priceColor: string;
  glowColor: string;
  priceChange: number;
  priceChangeValue: number;
  isPositiveChange: boolean;
  fontSize: {
    title: number;
    price: number;
    small: number;
  };
  iconSize: number;
  padding: {
    x: number;
    y: number;
  };
  headerHeight: number;
}

export interface PricePathProps {
  priceData: number[];
  timeScale: d3.ScaleTime<number, number>;
  priceScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  headerHeight: number;
  padding: {
    x: number;
    y: number;
  };
  glowColor: string;
  strokeWidth?: number;
  circleRadius?: number;
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
  lineDrawProgress?: number;
  priceChange?: number;
  darkMode?: boolean;
  isAnimatingNewSegment?: boolean;
  lastTwoPoints?: [number, number][];
  newSegmentProgress?: number;
  delayedPathData?: number[];
  delayedPathProgress?: number;
  isAnimatingDelayedPath?: boolean;
}

export interface ChartColors {
  up: string;
  down: string;
  upGlow: string;
  downGlow: string;
  background: string;
  cardBg: string;
  text: string;
  grid: string;
  gridText: string;
  accent: string;
  neutral: string;
}

export type PricePoint = number; 