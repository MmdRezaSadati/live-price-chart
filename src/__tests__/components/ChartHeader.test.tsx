import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartHeader from '@/components/ChartHeader';
import { COLORS } from '@/constants/chart';

const defaultProps = {
  price: '45100.00',
  priceColor: COLORS.up,
  priceChange: '2.5',
  priceChangeValue: 1000,
  isPositiveChange: true,
  padding: { x: 20, y: 20 },
  headerHeight: 60,
  fontSize: {
    title: 20,
    price: 24,
    small: 14
  },
  iconSize: 40,
  glowColor: 'rgba(74, 222, 128, 0.5)'
};

describe('ChartHeader', () => {
  it('renders the Bitcoin title and logo', () => {
    render(<ChartHeader {...defaultProps} />);
    
    const title = screen.getByText('Bitcoin');
    const logo = screen.getByText('₿');
    const subtitle = screen.getByText('BTCUSDT • Live Chart');
    
    expect(title).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
    expect(title).toHaveClass('font-bold');
    expect(logo).toHaveClass('text-black font-bold');
    expect(logo.parentElement).toHaveStyle({
      background: COLORS.accent,
      boxShadow: '0 0 15px rgba(252, 211, 77, 0.5)',
      width: '40px',
      height: '40px'
    });
  });

  it('formats the price correctly', () => {
    render(<ChartHeader {...defaultProps} />);
    
    const priceContainer = document.querySelector('.font-mono.font-bold');
    expect(priceContainer).toBeInTheDocument();
    expect(priceContainer).toHaveTextContent(`$${defaultProps.price}`);
    expect(priceContainer).toHaveStyle({ 
      color: COLORS.up,
      textShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
      fontSize: '24px'
    });
  });

  it('handles positive price change', () => {
    render(<ChartHeader {...defaultProps} />);
    
    const priceChangeContainer = document.querySelector('.font-medium');
    expect(priceChangeContainer).toBeInTheDocument();
    expect(priceChangeContainer).toHaveTextContent(`▲ ${defaultProps.priceChange}%`);
    expect(priceChangeContainer).toHaveStyle({ 
      color: COLORS.up,
      fontSize: '14px'
    });
  });

  it('handles negative price change', () => {
    render(<ChartHeader {...defaultProps} isPositiveChange={false} priceChange="-2.5" priceChangeValue={-1000} />);
    
    const priceChangeContainer = document.querySelector('.font-medium');
    expect(priceChangeContainer).toBeInTheDocument();
    expect(priceChangeContainer).toHaveTextContent('▼ -2.5%');
    expect(priceChangeContainer).toHaveStyle({ 
      color: COLORS.down,
      fontSize: '14px'
    });
  });

  it('applies correct font sizes', () => {
    render(<ChartHeader {...defaultProps} />);
    
    const title = screen.getByText('Bitcoin');
    const priceContainer = document.querySelector('.font-mono.font-bold');
    const priceChangeContainer = document.querySelector('.font-medium');
    const subtitle = screen.getByText('BTCUSDT • Live Chart');
    
    expect(title).toHaveStyle({ fontSize: '20px' });
    expect(priceContainer).toHaveStyle({ fontSize: '24px' });
    expect(priceChangeContainer).toHaveStyle({ fontSize: '14px' });
    expect(subtitle).toHaveStyle({ fontSize: '14px' });
  });

  it('applies correct styles to header container', () => {
    render(<ChartHeader {...defaultProps} />);
    
    const container = screen.getByTestId('chart-header');
    expect(container).toHaveClass('absolute top-0 left-0 right-0 flex justify-between items-center z-10');
  });
}); 