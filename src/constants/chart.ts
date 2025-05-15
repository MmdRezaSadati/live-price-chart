import { ChartColors } from '../types/chart';

/**
 * Chart animation settings
 */
export const CHART_ANIMATION = {
  /**
   * Duration in milliseconds for drawing new line segments
   * Higher values = smoother line drawing
   */
  LINE_DRAW_DURATION: 1000,

  /**
   * Base duration for line draw (ms)
   */
  BASE_LINE_DRAW_DURATION: 1000,

  /**
   * Minimum transition duration (ms)
   */
  MIN_TRANSITION_DURATION: 200,

  /**
   * Maximum transition duration (ms)
   */
  MAX_TRANSITION_DURATION: 2000,

  /**
   * Price change threshold for animation (percent)
   */
  PRICE_CHANGE_THRESHOLD: 2,

  /**
   * Zoom threshold for animation
   */
  ZOOM_THRESHOLD: 5,

  /**
   * Easing function for animations
   * 'cubic' = cubic-bezier ease out
   */
  LINE_EASING: 'cubic-bezier',
  
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
  },

  /**
   * Delayed path animation settings
   */
  DELAYED_PATH: {
    /**
     * Number of data points to keep in buffer
     */
    BUFFER_SIZE: 10,

    /**
     * Duration in milliseconds for drawing the delayed path
     */
    DRAW_DURATION: 1000,

    /**
     * Interval in milliseconds for checking new data
     */
    UPDATE_INTERVAL: 1000
  }
};

/**
 * Maximum number of data points to keep in the chart
 */
export const MAX_DATA_POINTS = 40;

/**
 * Bitcoin symbol is fixed - this is a Bitcoin-only chart
 */
export const BITCOIN_SYMBOL = 'btcusdt';

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