import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LivePriceChart from '@/components/common/chart/LivePriceChart';
import { useWebSocket } from '@/hooks/useWebSocket';
import { usePriceAnimation, useLineDrawAnimation } from '@/hooks/useChartAnimations';
import { useChartScales } from '@/hooks/useChartScales';
import '@testing-library/jest-dom';
import { COLORS } from '@/constants/chart';

// Define mock colors directly to avoid out-of-scope variable error
const MOCK_COLORS = {
  accent: '#F7931A',
  up: '#22C55E',
  down: '#EF4444',
  text: '#FFFFFF',
  background: '#121212'
};

// Mock d3 and other dependencies before importing components
jest.mock('d3', () => ({
  min: jest.fn((data, accessor) => data.length > 0 ? Math.min(...data.map(accessor)) : 0),
  max: jest.fn((data, accessor) => data.length > 0 ? Math.max(...data.map(accessor)) : 0),
  line: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
    curve: jest.fn().mockReturnThis(),
  })),
  curveCatmullRom: {
    alpha: jest.fn().mockReturnValue('mocked-curve'),
  },
}));

// Mock the WebSocket hook
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: jest.fn(() => ({
    priceData: [
      { timestamp: 1000, price: 45000 },
      { timestamp: 2000, price: 45100 },
      { timestamp: 3000, price: 45200 }
    ],
    currentPrice: 45200,
    isNewPoint: false,
    setIsNewPoint: jest.fn(),
    priceChange: 2.5,
    priceChangeValue: 200,
    lastPriceRef: { current: 45000 },
    isConnected: true,
    error: null,
    ws: null
  }))
}));

// Mock requestAnimationFrame for animations
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 0);
  return 0;
});

// Create a mock WebSocket class that will simulate real-time data
class MockWebSocket {
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  url: string;
  
  constructor(url: string) {
    this.url = url;
    // Simulate connection established
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event('open'));
      this.sendMockPrices();
    }, 50);
  }
  
  // Simulate receiving price data
  sendMockPrices() {
    const basePrice = 45000;
    let currentPrice = basePrice;
    
    // Send initial price
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { 
        data: JSON.stringify({ 
          p: currentPrice.toString(),
          s: 'BTCUSDT',
          T: Date.now(),
        })
      }));
    }
    
    // Send a series of prices with slight variations
    const sendNextPrice = () => {
      // Random price change between -100 and +100
      const change = Math.floor(Math.random() * 200) - 100;
      currentPrice = Math.max(44000, Math.min(46000, currentPrice + change));
      
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { 
          data: JSON.stringify({ 
            p: currentPrice.toString(),
            s: 'BTCUSDT',
            T: Date.now(),
          })
        }));
      }
    };
    
    // Send prices at intervals
    const intervals = [100, 200, 300, 400, 500];
    intervals.forEach((delay, index) => {
      setTimeout(sendNextPrice, delay);
    });
  }
  
  send() {
    // Mock implementation
  }
  
  close() {
    if (this.onclose) this.onclose(new CloseEvent('close'));
  }
  
  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    if (type === 'open') this.onopen = listener as any;
    if (type === 'message') this.onmessage = listener as any;
    if (type === 'close') this.onclose = listener as any;
    if (type === 'error') this.onerror = listener as any;
  }
  
  removeEventListener() {
    // Mock implementation
  }
}

// Setup the mock before tests
beforeEach(() => {
  // Replace the WebSocket implementation with our mock
  global.WebSocket = MockWebSocket as any;
  
  // Setup fake timers
  jest.useFakeTimers();
});

afterEach(() => {
  // Restore timers
  jest.useRealTimers();
});

// Mock the hooks
jest.mock('@/hooks/useWebSocket');
jest.mock('@/hooks/useChartAnimations', () => ({
  usePriceAnimation: jest.fn((currentPrice) => ({
    animatedPrice: currentPrice ?? 0,
    isAnimating: false
  })),
  useLineDrawAnimation: jest.fn(() => ({
    lineDrawProgress: 0.98
  }))
}));
jest.mock('@/hooks/useChartScales', () => ({
  useChartScales: jest.fn(() => ({
    timeScale: (x: number) => x,
    priceScale: (y: number) => y,
    priceBounds: { min: 45000, max: 45200 },
    constrainPrice: (price: number) => Math.min(Math.max(price, 45000), 45200),
    generatePath: () => 'M 0,0 L 100,100'
  }))
}));

// Mock child components
jest.mock('@/components/common/chart/components/ChartHeader', () => ({
  ChartHeader: jest.fn(({ price, priceColor, priceChange, priceChangeValue, isPositiveChange }) => (
    <div data-testid="chart-header">
      <div data-testid="chart-title">BTCUSDT • Live Chart</div>
      <div data-testid="price-display">
        <span>$</span>
        <span>{price}</span>
      </div>
      <div data-testid="price-change" style={{ color: priceColor }}>
        {isPositiveChange ? '▲' : '▼'} {priceChange}%
        <span>(${Math.abs(priceChangeValue).toFixed(2)})</span>
      </div>
    </div>
  ))
}));

jest.mock('@/components/common/chart/components/TimeRangeControls', () => ({
  TimeRangeControls: jest.fn(({ selectedRange, onRangeChange }) => (
    <div data-testid="time-range-controls">
      <button
        data-testid="range-1h"
        onClick={() => onRangeChange('1h')}
        style={{ backgroundColor: selectedRange === '1h' ? MOCK_COLORS.accent : 'transparent' }}
      >
        1h
      </button>
      <button
        data-testid="range-1d"
        onClick={() => onRangeChange('1d')}
        style={{ backgroundColor: selectedRange === '1d' ? MOCK_COLORS.accent : 'transparent' }}
      >
        1d
      </button>
    </div>
  ))
}));

jest.mock('@/components/common/chart/components/PricePath', () => ({
  PricePath: jest.fn(() => <div data-testid="price-path" />)
}));

jest.mock('@/components/common/chart/components/ChartStats', () => ({
  ChartStats: jest.fn(() => <div data-testid="chart-stats" />)
}));

describe('LivePriceChart Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all chart components when data is available', () => {
    render(<LivePriceChart width={800} height={500} />);

    // Check that all main components are rendered
    expect(screen.getByText('BTCUSDT • Live Chart')).toBeInTheDocument();
    
    // Price should be rendered as separate elements
    const priceElement = screen.getByText((content, element) => {
      return content.includes('45200');
    });
    expect(priceElement).toBeInTheDocument();
    
    // Price change - check the parent div instead of trying to match exact text
    const priceChangeElement = screen.getByTestId('chart-header');
    expect(priceChangeElement).toBeInTheDocument();
    expect(priceChangeElement).toHaveTextContent('2.50');
    expect(priceChangeElement).toHaveTextContent('%');
    
    expect(screen.getByTestId('time-range-controls')).toBeInTheDocument();
    expect(screen.getByTestId('price-path')).toBeInTheDocument();
    expect(screen.getByTestId('chart-stats')).toBeInTheDocument();
  });

  it('updates when price data changes', () => {
    render(<LivePriceChart width={800} height={500} />);

    // Initial price should be visible
    const initialPriceElement = screen.getByText((content, element) => {
      return content.includes('45200');
    });
    expect(initialPriceElement).toBeInTheDocument();

    // Update the price
    (useWebSocket as jest.Mock).mockImplementation(() => ({
      priceData: [
        { timestamp: 1000, price: 45000 },
        { timestamp: 2000, price: 45500 },
        { timestamp: 3000, price: 46000 }
      ],
      currentPrice: 46000,
      isNewPoint: true,
      setIsNewPoint: jest.fn(),
      priceChange: 3.5,
      priceChangeValue: 3000,
      lastPriceRef: { current: 45000 },
      isConnected: true,
      error: null,
      ws: null
    }));
    
    // Re-render to see the updates
    render(<LivePriceChart width={800} height={500} />);

    // Check the updated elements
    const updatedPriceElement = screen.getByText((content, element) => {
      return content.includes('46000');
    });
    expect(updatedPriceElement).toBeInTheDocument();
    
    // Price change - check the parent div instead
    const chartHeader = screen.getAllByTestId('chart-header')[1]; // Get the second instance from the re-render
    expect(chartHeader).toHaveTextContent('3.50');
    expect(chartHeader).toHaveTextContent('%');
  });

  it('handles time range changes', () => {
    render(<LivePriceChart width={800} height={500} />);

    // Click the 1h button
    const hourButton = screen.getByTestId('range-1h');
    fireEvent.click(hourButton);

    // Verify that the time range was updated by checking the background color
    expect(hourButton).toHaveStyle({
      backgroundColor: MOCK_COLORS.accent
    });

    // Click the 1d button
    const dayButton = screen.getByTestId('range-1d');
    fireEvent.click(dayButton);

    // Verify that the time range was updated
    expect(dayButton).toHaveStyle({
      backgroundColor: MOCK_COLORS.accent
    });
    expect(hourButton).toHaveStyle({
      backgroundColor: 'transparent'
    });
  });
});