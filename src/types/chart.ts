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
 * Props for the price path component
 */
export interface PricePathProps {
  priceData: PricePoint[];
  timeScale: any;
  priceScale: any;
  width: number;
  height: number;
  headerHeight: number;
  padding: {
    x: number;
    y: number;
  };
  chartColor: string;
  glowColor: string;
  linePath: string;
  visibleEndPoint: {
    x: number;
    y: number;
  };
  animatedPrice: number;
  strokeWidth: number;
  circleRadius: number;
  onLinePathRef: (ref: SVGPathElement | null) => void;
  onCircleRef: (ref: SVGCircleElement | null) => void;
  fontSize: {
    labels: number;
  };
  lineDrawProgress?: number;
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