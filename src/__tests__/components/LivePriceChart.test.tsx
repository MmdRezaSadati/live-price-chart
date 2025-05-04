import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LivePriceChart from '@/components/common/chart/LivePriceChart';
import { useWebSocket } from '@/hooks/useWebSocket';
import * as chartAnimations from '@/hooks/useChartAnimations';

// Define mock colors directly to avoid out-of-scope variable error
const MOCK_COLORS = {
  accent: '#F7931A',
  up: '#22C55E',
  down: '#EF4444',
  text: '#FFFFFF',
  background: '#121212'
};

// Type definitions for mock components
interface FontSize {
  title?: number;
  price?: number;
  small?: number;
  labels?: number;
}

interface Padding {
  x: number;
  y: number;
}

interface ChartHeaderProps {
  price: string;
  priceColor: string;
  priceChange: string;
  priceChangeValue: number;
  isPositiveChange: boolean;
  glowColor?: string;
  fontSize?: FontSize;
  iconSize?: number;
  padding?: Padding;
  headerHeight?: number;
}

interface TimeRangeControlsProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  headerHeight?: number;
  padding?: Padding;
  fontSize?: { small: number };
}

// Mock the hooks used by LivePriceChart
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: jest.fn(() => ({
    priceData: [
      { timestamp: 1000, price: 45000 },
      { timestamp: 2000, price: 46000 },
      { timestamp: 3000, price: 47000 }
    ],
    currentPrice: 47000,
    isNewPoint: false,
    setIsNewPoint: jest.fn(),
    priceChange: 2.5,
    priceChangeValue: 2000,
    lastPriceRef: { current: 45000 },
    isConnected: true,
    error: null,
    ws: null
  }))
}));

jest.mock('@/hooks/useChartAnimations', () => ({
  usePriceAnimation: jest.fn(() => ({ animatedPrice: 47000, isAnimating: false })),
  useLineDrawAnimation: jest.fn(() => ({
    lineDrawProgress: 1.0,
    visiblePercent: 1.0,
    basePosition: 0,
    setIsNewPoint: jest.fn()
  }))
}));

jest.mock('@/hooks/useChartScales', () => ({
  useChartScales: jest.fn(() => ({
    timeScale: (x: number) => x * 2,
    priceScale: (y: number) => y * 0.5,
    priceBounds: { min: 40000, max: 50000 },
    constrainPrice: (price: number) => price,
    generatePath: () => 'M0,0 L100,100'
  }))
}));

// Mock child components
jest.mock('@/components/ChartHeader', () => ({
  __esModule: true,
  default: (props: ChartHeaderProps) => (
    <div data-testid="chart-header">
      <div data-testid="price-container">
        <div data-testid="price-display">${props.price}</div>
        <div data-testid="price-change">
          {props.isPositiveChange ? "▲" : "▼"} {props.priceChange}%
          <span>(${Math.abs(props.priceChangeValue).toFixed(2)})</span>
        </div>
      </div>
    </div>
  )
}));

jest.mock('@/components/common/chart/components/TimeRangeControls', () => ({
  TimeRangeControls: (props: TimeRangeControlsProps) => (
    <div data-testid="time-range-controls">
      <button
        data-testid="range-1h"
        onClick={() => props.onRangeChange('1h')}
      >
        1h
      </button>
      <button
        data-testid="range-1d"
        onClick={() => props.onRangeChange('1d')}
      >
        1d
      </button>
    </div>
  )
}));

jest.mock('@/components/common/chart/components/PricePath', () => ({
  PricePath: () => <div data-testid="price-path" />
}));

jest.mock('@/components/common/chart/components/ChartStats', () => ({
  ChartStats: () => <div data-testid="chart-stats">Chart Stats</div>
}));

describe('LivePriceChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the loading state when price data is insufficient', () => {
    (useWebSocket as jest.Mock).mockReturnValueOnce({
      priceData: [],
      currentPrice: null,
      isNewPoint: false,
      setIsNewPoint: jest.fn(),
      priceChange: 0,
      priceChangeValue: 0,
      lastPriceRef: { current: null },
      isConnected: false,
      error: null,
      ws: null
    });
    
    render(<LivePriceChart />);
    
    expect(screen.getByText('Loading Bitcoin data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('renders all chart components when data is available', () => {
    render(<LivePriceChart />);
    
    expect(screen.getByTestId('chart-header')).toBeInTheDocument();
    expect(screen.getByTestId('price-container')).toBeInTheDocument();
    expect(screen.getByTestId('price-display')).toBeInTheDocument();
    expect(screen.getByTestId('price-change')).toBeInTheDocument();
    
    // Check if price display shows the correct price
    expect(screen.getByTestId('price-display')).toHaveTextContent('47000');
    
    // Check if price change shows the correct values - use includes() to handle the complete text
    const priceChangeElement = screen.getByTestId('price-change');
    expect(priceChangeElement.textContent).toContain('2.5');
    expect(priceChangeElement.textContent).toContain('%');
    expect(priceChangeElement.textContent).toContain('2000.00');
    
    expect(screen.getByTestId('time-range-controls')).toBeInTheDocument();
    expect(screen.getByTestId('price-path')).toBeInTheDocument();
    expect(screen.getByTestId('chart-stats')).toBeInTheDocument();
  });
  
  it('handles time range selection', async () => {
    const user = userEvent.setup();
    render(<LivePriceChart />);
    
    const hourButton = screen.getByTestId('range-1h');
    await act(async () => {
      await user.click(hourButton);
    });
    
    const dayButton = screen.getByTestId('range-1d');
    await act(async () => {
      await user.click(dayButton);
    });
  });
  
  it('applies correct dimensions', () => {
    const width = 1000;
    const height = 600;
    render(<LivePriceChart width={width} height={height} />);
    
    const container = screen.getByTestId('chart-header').parentElement;
    expect(container).toHaveClass('relative rounded-xl overflow-hidden shadow-2xl w-full h-full');
  });
  
  it('updates when price data changes', () => {
    const onPriceUpdate = jest.fn();
    
    // Initial render
    const { rerender } = render(<LivePriceChart onPriceUpdate={onPriceUpdate} />);
    
    // Update the price data
    (useWebSocket as jest.Mock).mockReturnValueOnce({
      priceData: [
        { timestamp: 1000, price: 45000 },
        { timestamp: 2000, price: 46000 },
        { timestamp: 3000, price: 48000 }
      ],
      currentPrice: 48000,
      isNewPoint: true,
      setIsNewPoint: jest.fn(),
      priceChange: 3.5,
      priceChangeValue: 3000,
      lastPriceRef: { current: 45000 },
      isConnected: true,
      error: null,
      ws: null
    });
    
    // Mock price animation
    jest.spyOn(chartAnimations, 'usePriceAnimation').mockReturnValue({
      animatedPrice: 48000,
      isAnimating: false
    });
    
    act(() => {
      rerender(<LivePriceChart onPriceUpdate={onPriceUpdate} />);
    });
    
    // Check if price display shows the updated price
    expect(screen.getByTestId('price-display')).toHaveTextContent('48000');
    
    // Check if price change shows the updated values - use includes() to handle the complete text
    const priceChangeElement = screen.getByTestId('price-change');
    expect(priceChangeElement.textContent).toContain('3.5');
    expect(priceChangeElement.textContent).toContain('%');
    expect(priceChangeElement.textContent).toContain('3000.00');
  });
}); 