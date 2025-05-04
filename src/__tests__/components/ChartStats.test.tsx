import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartStats } from '@/components/common/chart/components/ChartStats';
import { CHART_STATS } from '@/constants/chart';

describe('ChartStats', () => {
  const defaultProps = {
    fontSize: {
      small: 12,
      labels: 10,
    },
    padding: {
      x: 20,
      y: 20,
    },
  };

  it('renders all chart statistics', () => {
    render(<ChartStats {...defaultProps} />);
    
    // Check that all stats are rendered
    CHART_STATS.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    });
  });

  it('renders the live indicator', () => {
    render(<ChartStats {...defaultProps} />);
    
    // Check for live indicator
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    
    // Check that the live indicator has a pulsing dot
    const liveIndicator = screen.getByText('LIVE').parentElement;
    expect(liveIndicator).toHaveClass('flex items-center opacity-70');
    
    // Check that the dot exists and has the right classes
    const pulseDot = liveIndicator?.querySelector('.animate-pulse');
    expect(pulseDot).toBeInTheDocument();
    expect(pulseDot).toHaveClass('bg-green-500');
  });

  it('applies correct styling based on props', () => {
    const customProps = {
      fontSize: {
        small: 14,
        labels: 12,
      },
      padding: {
        x: 30,
        y: 40,
      },
    };
    
    render(<ChartStats {...customProps} />);
    
    // Check the container has the correct padding
    const container = screen.getByText('LIVE').closest('div')?.parentElement;
    expect(container).toHaveStyle({
      bottom: '40px',
      padding: '0 30px',
    });
    
    // Check that the labels have the correct font size
    const labels = screen.getAllByText(CHART_STATS[0].label);
    expect(labels[0]).toHaveStyle({
      fontSize: '12px',
    });
    
    // Check that the values have the correct font size
    const values = screen.getAllByText(CHART_STATS[0].value);
    expect(values[0]).toHaveStyle({
      fontSize: '14px',
    });
  });
}); 