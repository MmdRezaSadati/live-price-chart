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
   * Lower values = faster line drawing
   */
  LINE_DRAW_DURATION: 600,
  
  /**
   * Easing function for the line drawing animation
   * Default is cubic ease out: 1 - Math.pow(1 - progress, 3)
   */
  LINE_EASING: 'cubic',
  
  /**
   * Duration in milliseconds for price changes
   * Affects how fast the chart reacts to new prices
   */
  PRICE_CHANGE_DURATION: 600,
  
  /**
   * Duration in milliseconds for one complete movement cycle
   * Controls how long it takes for the line to draw from start to end
   * Higher values = slower, smoother movement
   */
  OSCILLATION_CYCLE: 20000,
  
  /**
   * Range for the drawing animation
   * Only moves forward, never backward
   */
  OSCILLATION_RANGE: {
    MIN: 0.90,  // Starting position (higher = less of the line resets)
    MAX: 1.0    // Ending position (always fully drawn at the end)
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