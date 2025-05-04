import { renderHook, act } from '@testing-library/react';
import { usePriceAnimation, useLineDrawAnimation } from '@/hooks/useChartAnimations';
import { PricePoint } from '@/types/chart';
import { CHART_ANIMATION } from '@/constants/chart';

// Mock requestAnimationFrame
const mockRAF = jest.fn();
const mockCancelRAF = jest.fn();
global.requestAnimationFrame = mockRAF;
global.cancelAnimationFrame = mockCancelRAF;

// Mock performance.now
const mockPerformanceNow = jest.fn();
global.performance.now = mockPerformanceNow;

describe('usePriceAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });
  
  it('should initialize with null price', () => {
    const { result } = renderHook(() => usePriceAnimation(null, 100));
    
    expect(result.current.animatedPrice).toBe(0);
    expect(result.current.isAnimating).toBe(false);
  });
  
  it('should set price initially without animation', () => {
    const { result } = renderHook(() => usePriceAnimation(50000, 100));
    
    expect(result.current.animatedPrice).toBe(50000);
    expect(result.current.isAnimating).toBe(false);
  });
  
  it('should animate price changes', () => {
    const onPriceUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ currentPrice }) => usePriceAnimation(currentPrice, 2, onPriceUpdate),
      { initialProps: { currentPrice: 50000 } }
    );

    // Initial state
    expect(result.current.animatedPrice).toBe(50000);
    expect(result.current.isAnimating).toBe(false);

    // Update price
    rerender({ currentPrice: 50100 });

    // Simulate animation frame at 100ms
    act(() => {
      mockPerformanceNow.mockReturnValue(100);
      mockRAF.mock.calls[0][0](100);
    });

    // Should be animating
    expect(result.current.animatedPrice).toBeGreaterThan(50000);
    expect(result.current.animatedPrice).toBeLessThan(50100);
    expect(result.current.isAnimating).toBe(true);
    expect(onPriceUpdate).toHaveBeenCalled();

    // Complete animation at 1000ms
    act(() => {
      mockPerformanceNow.mockReturnValue(1000);
      mockRAF.mock.calls[1][0](1000);
    });

    expect(Math.abs(result.current.animatedPrice - 50100)).toBeLessThan(0.1);
    expect(result.current.isAnimating).toBe(true);
    expect(onPriceUpdate).toHaveBeenLastCalledWith(50100);
  });
  
  it('should call onPriceUpdate callback when animation completes', () => {
    const onPriceUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ currentPrice }) => usePriceAnimation(currentPrice, 2, onPriceUpdate),
      { initialProps: { currentPrice: 50000 } }
    );

    // Update price
    rerender({ currentPrice: 50200 });

    // Complete animation
    act(() => {
      mockPerformanceNow.mockReturnValue(1000);
      mockRAF.mock.calls[0][0](1000);
    });

    // Callback should be called with the new price
    expect(onPriceUpdate).toHaveBeenLastCalledWith(50200);
  });
});

describe('useLineDrawAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });
  
  it('should initialize animation state', () => {
    const setIsNewPoint = jest.fn();
    const priceData: PricePoint[] = [];
    const { result } = renderHook(() => useLineDrawAnimation(true, setIsNewPoint, priceData));

    // Initial state should match CHART_ANIMATION constants
    expect(result.current.lineDrawProgress).toBe(0.98);
    expect(result.current.visiblePercent).toBe(0.2);
    expect(result.current.basePosition).toBe(0.98);

    // Simulate animation frame
    act(() => {
      mockPerformanceNow.mockReturnValue(CHART_ANIMATION.OSCILLATION_CYCLE / 2);
      mockRAF.mock.calls[0][0](CHART_ANIMATION.OSCILLATION_CYCLE / 2);
    });

    // Values should stay within the oscillation range
    expect(result.current.lineDrawProgress).toBeGreaterThanOrEqual(CHART_ANIMATION.OSCILLATION_RANGE.MIN);
    expect(result.current.lineDrawProgress).toBeLessThanOrEqual(CHART_ANIMATION.OSCILLATION_RANGE.MAX);
  });
  
  it('should animate when new data arrives', () => {
    const setIsNewPoint = jest.fn();
    const initialPriceData: PricePoint[] = [{ timestamp: 0, price: 50000 }];
    const { result, rerender } = renderHook(
      ({ isNewPoint, priceData }) => useLineDrawAnimation(isNewPoint, setIsNewPoint, priceData),
      { initialProps: { isNewPoint: false, priceData: initialPriceData } }
    );

    // Initial state
    expect(result.current.lineDrawProgress).toBe(0.98);
    expect(result.current.visiblePercent).toBe(0.2);
    expect(result.current.basePosition).toBe(0.98);

    // Add new data point
    const newPriceData = [...initialPriceData, { timestamp: 1000, price: 50100 }];
    rerender({ isNewPoint: true, priceData: newPriceData });

    // Start animation
    act(() => {
      mockPerformanceNow.mockReturnValue(0);
      mockRAF.mock.calls[0][0](0);
    });

    // Values should stay within the oscillation range
    expect(result.current.lineDrawProgress).toBeGreaterThanOrEqual(CHART_ANIMATION.OSCILLATION_RANGE.MIN);
    expect(result.current.lineDrawProgress).toBeLessThanOrEqual(CHART_ANIMATION.OSCILLATION_RANGE.MAX);

    // Complete animation
    act(() => {
      mockPerformanceNow.mockReturnValue(CHART_ANIMATION.LINE_DRAW_DURATION);
      mockRAF.mock.calls[1][0](CHART_ANIMATION.LINE_DRAW_DURATION);
    });

    expect(setIsNewPoint).toHaveBeenCalledWith(false);
  });
});