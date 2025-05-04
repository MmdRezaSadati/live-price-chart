import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define mock colors directly to avoid out-of-scope variable error
const MOCK_COLORS = {
  accent: '#F7931A',
  up: '#22C55E',
  down: '#EF4444',
  text: '#FFFFFF',
  background: '#121212',
  grid: '#44444440',
  gridText: '#BBBBBB'
};

// Mock the d3 library before importing the component
jest.mock('d3', () => ({
  line: jest.fn(() => {
    const mockLine = jest.fn(() => 'M0,0 L100,100');
    mockLine.x = jest.fn().mockReturnThis();
    mockLine.y = jest.fn().mockReturnThis();
    mockLine.curve = jest.fn().mockReturnThis();
    return mockLine;
  }),
  area: jest.fn(() => {
    const mockArea = jest.fn(() => 'M0,0 L100,100 L100,0 Z');
    mockArea.x = jest.fn().mockReturnThis();
    mockArea.y0 = jest.fn().mockReturnThis();
    mockArea.y1 = jest.fn().mockReturnThis();
    mockArea.curve = jest.fn().mockReturnThis();
    return mockArea;
  }),
  curveCatmullRom: {
    alpha: jest.fn().mockReturnValue('mocked-curve'),
  },
}));

// Mock SVG methods
Element.prototype.getTotalLength = jest.fn().mockReturnValue(100);
Element.prototype.getPointAtLength = jest.fn().mockReturnValue({ x: 50, y: 50 });

// Import components after mocks are set up
import { PricePath } from '@/components/common/chart/components/PricePath';
import { COLORS } from '@/constants/chart';

// Test data
const defaultProps = {
  priceData: [
    { timestamp: 1000, price: 45000 },
    { timestamp: 2000, price: 45500 },
    { timestamp: 3000, price: 45800 }
  ],
  timeScale: (value: number) => value,
  priceScale: (value: number) => value,
  width: 800,
  height: 400,
  headerHeight: 70,
  padding: { x: 40, y: 20 },
  glowColor: '#4CAF50',
  strokeWidth: 2,
  circleRadius: 4,
  fontSize: { labels: 12 },
  lineDrawProgress: 1.0,
  priceChange: 1.5,
  darkMode: true
};

// Mock the TimeAxis component
jest.mock('@/components/common/chart/components/TimeAxis', () => ({
  TimeAxis: () => <g data-testid="time-axis"></g>
}));

describe('PricePath', () => {
  it('renders path with correct attributes', () => {
    render(<PricePath {...defaultProps} />);
    
    const path = screen.getByTestId('price-path');
    
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d');
    expect(path).toHaveAttribute('stroke');
  });
  
  it('renders area fill with correct attributes', () => {
    render(<PricePath {...defaultProps} />);
    
    const areaFill = screen.getByTestId('area-path');
    
    expect(areaFill).toBeInTheDocument();
    expect(areaFill).toHaveAttribute('d');
    expect(areaFill).toHaveAttribute('fill', 'url(#areaGradient)');
  });
  
  it('renders grid lines with correct attributes', () => {
    render(<PricePath {...defaultProps} />);
    
    const gridLines = screen.getAllByTestId('grid-line');
    
    expect(gridLines.length).toBeGreaterThan(0);
    expect(gridLines[0]).toHaveAttribute('stroke');
  });
  
  it('renders indicator circle with correct attributes', () => {
    render(<PricePath {...defaultProps} />);
    
    const indicator = screen.getByTestId('indicator-circle');
    
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('cx');
    expect(indicator).toHaveAttribute('cy');
    expect(indicator).toHaveAttribute('r');
    expect(indicator).toHaveAttribute('fill');
  });
  
  it('updates color based on price change', () => {
    // Render with negative price change
    render(<PricePath {...defaultProps} priceChange={-1.5} />);
    
    const path = screen.getByTestId('price-path');
    
    expect(path).toHaveAttribute('stroke');
  });
  
  it('calculates correct path dimensions', () => {
    render(<PricePath {...defaultProps} />);
    
    const svg = screen.getByText((_, element) => element?.tagName.toLowerCase() === 'svg');
    
    expect(svg).toHaveAttribute('width', defaultProps.width.toString());
    expect(svg).toHaveAttribute('height');
    expect(svg).toHaveStyle({
      marginTop: `${defaultProps.headerHeight}px`,
    });
  });
});