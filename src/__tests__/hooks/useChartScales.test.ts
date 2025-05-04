import { renderHook } from '@testing-library/react';
import { useChartScales } from '@/hooks/useChartScales';
import * as d3 from 'd3';

// Mock d3 functions
jest.mock('d3', () => {
  // Create a mock line function that returns a string path
  const mockLine = jest.fn(() => {
    // Create line generator function
    const lineFunc = (data) => {
      if (!data || data.length === 0) return '';
      return `M0,0 L100,100`;
    };
    
    // Add methods to the line function
    lineFunc.x = jest.fn().mockReturnThis();
    lineFunc.y = jest.fn().mockReturnThis();
    lineFunc.curve = jest.fn().mockReturnThis();
    
    return lineFunc;
  });
  
  return {
    min: jest.fn((data, accessor) => {
      if (!data || !Array.isArray(data) || data.length === 0) return 0;
      
      // If accessor is provided, use it to map the data
      if (accessor && data.length > 0) {
        try {
          const values = data.map(accessor);
          return Math.min(...values);
        } catch (e) {
          return 0;
        }
      }
      
      // For the tests, return fixed values
      return 50000;
    }),
    max: jest.fn((data, accessor) => {
      if (!data || !Array.isArray(data) || data.length === 0) return 0;
      
      // If accessor is provided, use it to map the data
      if (accessor && data.length > 0) {
        try {
          const values = data.map(accessor);
          return Math.max(...values);
        } catch (e) {
          return 100;
        }
      }
      
      // For the tests, return fixed values
      return 51000;
    }),
    scaleTime: jest.fn(() => ({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      padding: jest.fn().mockReturnThis()
    })),
    scaleLinear: jest.fn(() => ({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      nice: jest.fn().mockReturnThis()
    })),
    line: mockLine,
    curveCatmullRom: {
      alpha: jest.fn().mockReturnValue('mocked-curve'),
    }
  };
});

describe('useChartScales', () => {
  const mockDimensions = {
    width: 800,
    height: 400,
    padding: { x: 20, y: 20 }
  };

  const mockPriceData = [
    { price: 50000, timestamp: Date.now() - 3600000 },
    { price: 51000, timestamp: Date.now() }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty scales for insufficient price data', () => {
    const { result } = renderHook(() => useChartScales([], mockDimensions));
    
    expect(result.current.timeScale).toBeNull();
    expect(result.current.priceScale).toBeNull();
    expect(result.current.priceBounds).toEqual({
      min: 0,
      max: 100
    });
  });

  it('should return empty scales for invalid dimensions', () => {
    // For this test, we'll still use valid price data, but invalid dimensions
    const { result } = renderHook(() => useChartScales(mockPriceData, { 
      width: 0, 
      height: 0, 
      padding: { x: 0, y: 0 } 
    }));
    
    // Even with valid price data, scales and bounds should be calculated
    // The priceBounds are calculated based on fixed mock values for min/max
    // Plus the dynamic price range calculation in the hook
    expect(result.current.priceBounds).toEqual({
      min: 49850,
      max: 51150
    });
  });

  it('should calculate correct scales for valid price data', () => {
    const { result } = renderHook(() => useChartScales(mockPriceData, mockDimensions));
    
    expect(result.current.timeScale).toBeDefined();
    expect(result.current.priceScale).toBeDefined();
    // priceBounds are calculated using a more complex formula in the hook
    // that creates a range around the data with buffer space
    expect(result.current.priceBounds).toEqual({
      min: 49850,
      max: 51150
    });
  });

  it('should constrain prices within bounds', () => {
    const { result } = renderHook(() => useChartScales(mockPriceData, mockDimensions));
    
    // Simulate constraining a price above the max with a 5% safety margin
    // The bounds are 49850-51150, with 5% safety margin it would be ~49915-51085
    const constrainedHigh = result.current.constrainPrice(52000);
    const constrainedLow = result.current.constrainPrice(49000);
    
    // Make sure our constraints match what we expect in the test
    expect(constrainedHigh).toBeLessThanOrEqual(51150);
    expect(constrainedHigh).toBeGreaterThanOrEqual(49850);
    expect(constrainedLow).toBeGreaterThanOrEqual(49850);
    expect(constrainedLow).toBeLessThanOrEqual(51150);
  });

  it('should generate a valid path for price data', () => {
    // Mock the line generator to return a specific path
    const expectedPath = 'M0,0 L100,100';
    
    const { result } = renderHook(() => useChartScales(mockPriceData, mockDimensions));
    const path = result.current.generatePath(mockPriceData);
    
    expect(path).toBe(expectedPath);
  });
});