/**
 * Chart data point representing a price at a specific timestamp
 */
export interface PricePoint {
  timestamp: number;
  price: number;
}

/**
 * Props for the main LivePriceChart component
 */
export interface LivePriceChartProps {
  width?: number;
  height?: number;
  onPriceUpdate?: (price: number) => void;
}

/**
 * Props for the ChartHeader component
 */
export interface ChartHeaderProps {
  price: string;
  priceColor: string;
  glowColor: string;
  priceChange: string;
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

/**
 * Props for the time range controls
 */
export interface TimeRangeControlsProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  headerHeight: number;
  padding: {
    x: number;
    y: number;
  };
  fontSize: {
    small: number;
  };
}

/**
 * Represents a D3 scale function
 */
export interface D3ScaleFunction {
  (value: number): number;
  domain(): number[];
  range(): number[];
  invert?(value: number): number;
}

/**
 * Props for the price path component
 */
export interface PricePathProps {
  priceData: PricePoint[];
  timeScale: D3ScaleFunction;
  priceScale: D3ScaleFunction;
  width: number;
  height: number;
  headerHeight: number;
  padding: {
    x: number;
    y: number;
  };
  chartColor: string;
  glowColor: string;
  strokeWidth: number;
  circleRadius: number;
  fontSize: {
    labels: number;
  };
  lineDrawProgress?: number;
  priceChange?: number;
  darkMode?: boolean;
  isAnimatingNewSegment?: boolean;
  newSegmentProgress?: number;
  lastTwoPoints?: {
    prev: PricePoint | null;
    current: PricePoint | null;
  };
}

/**
 * Props for the chart statistics component
 */
export interface ChartStatsProps {
  fontSize: {
    small: number;
    labels: number;
  };
  padding: {
    x: number;
    y: number;
  };
}

/**
 * Chart colors configuration
 */
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