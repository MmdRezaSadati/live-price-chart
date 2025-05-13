import { CHART_ANIMATION } from '@/constants/chart';

/**
 * Calculates the dynamic transition duration based on price change and zoom level
 * @param priceChange The percentage change in price
 * @param zoomLevel The current zoom level of the chart
 * @returns The calculated transition duration in milliseconds
 */
export const calculateTransitionDuration = (
  priceChange: number,
  zoomLevel: number
): number => {
  const {
    BASE_LINE_DRAW_DURATION,
    MIN_TRANSITION_DURATION,
    MAX_TRANSITION_DURATION,
    PRICE_CHANGE_THRESHOLD,
    ZOOM_THRESHOLD
  } = CHART_ANIMATION;

  // Calculate price change factor (0 to 1)
  const priceChangeFactor = Math.min(
    Math.abs(priceChange) / PRICE_CHANGE_THRESHOLD,
    1
  );

  // Calculate zoom factor (0 to 1)
  const zoomFactor = Math.min(
    (zoomLevel - 1) / (ZOOM_THRESHOLD - 1),
    1
  );

  // Combine factors (weighted average)
  const combinedFactor = (priceChangeFactor * 0.7) + (zoomFactor * 0.3);

  // Calculate duration (inverse relationship - higher factor = faster transition)
  const duration = BASE_LINE_DRAW_DURATION * (1 - combinedFactor * 0.7);

  // Ensure duration stays within bounds
  return Math.max(
    MIN_TRANSITION_DURATION,
    Math.min(MAX_TRANSITION_DURATION, duration)
  );
}; 