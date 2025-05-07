import { ChartColors } from '../types/chart';

/**
 * Chart color scheme - modern and attractive theme
 */
export const COLORS: ChartColors = {
  up: '#4ade80',       // Softer green for positive movement
  down: '#f87171',     // Softer red for negative movement
  upGlow: 'rgba(74, 222, 128, 0.4)', // Green glow
  downGlow: 'rgba(248, 113, 113, 0.4)', // Red glow
  background: '#0f172a', // Deep blue background
  cardBg: '#1e293b',     // Card background
  text: '#f1f5f9',       // Light text
  grid: 'rgba(148, 163, 184, 0.1)', // Grid lines
  gridText: 'rgba(148, 163, 184, 0.6)', // Grid text
  accent: '#fcd34d',     // Bitcoin yellow accent
  neutral: '#64748b',    // Neutral gray for UI elements
};

/**
 * Chart animation settings
 */
export const CHART_ANIMATION = {
  /**
   * Duration in milliseconds for drawing new line segments
   * Higher values = smoother line drawing
   */
  LINE_DRAW_DURATION: 3000,
  
  /**
   * Easing function for animations
   * 'cubic' = cubic-bezier ease out
   */
  LINE_EASING: 'cubic',
  
  /**
   * Time in milliseconds for one complete oscillation cycle
   * Higher values = smoother animation
   */
  OSCILLATION_CYCLE: 30000,
  
  /**
   * Range for the line drawing progress oscillation
   * MIN = minimum percent of path shown (0.9 = 90%)
   * MAX = maximum percent of path shown (1.0 = 100%)
   */
  OSCILLATION_RANGE: {
    MIN: 0.85,
    MAX: 1.0
  }
};

/**
 * Bitcoin symbol is fixed - this is a Bitcoin-only chart
 */
export const BITCOIN_SYMBOL = 'btcusdt';

/**
 * Maximum number of data points to keep in the chart
 */
export const MAX_DATA_POINTS = 150;

/**
 * Time range options for the chart
 */
export const TIME_RANGES = ['1m', '5m', '15m', '1h', '4h'];

/**
 * Stats displayed at the bottom of the chart
 */
export const CHART_STATS = [
  { label: '24h Vol', value: '$29.8B' },
  { label: '24h High', value: '$54,321' },
  { label: '24h Low', value: '$51,234' },
]; 