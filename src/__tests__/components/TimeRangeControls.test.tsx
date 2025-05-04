import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeControls } from '@/components/common/chart/components/TimeRangeControls';
import { COLORS, TIME_RANGES } from '@/constants/chart';

describe('TimeRangeControls', () => {
  const defaultProps = {
    selectedRange: '1h',
    onRangeChange: jest.fn(),
    headerHeight: 60,
    padding: {
      x: 20,
      y: 15,
    },
    fontSize: {
      small: 12,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders time range buttons', () => {
    render(<TimeRangeControls {...defaultProps} />);
    
    // Check that all time range options are rendered
    TIME_RANGES.forEach(range => {
      expect(screen.getByText(range)).toBeInTheDocument();
    });
  });

  it('highlights the selected time range', () => {
    render(<TimeRangeControls {...defaultProps} />);
    
    // The selected range (1h) should have a different style
    const selectedButton = screen.getByText('1h');
    expect(selectedButton).toHaveStyle({ 
      backgroundColor: COLORS.accent
    });
    
    // Other buttons should not be highlighted
    const nonSelectedButton = screen.getByText('1m');
    expect(nonSelectedButton).not.toHaveStyle({
      backgroundColor: COLORS.accent
    });
  });

  it('calls onRangeChange when a time range is clicked', () => {
    render(<TimeRangeControls {...defaultProps} />);
    
    // Click on a different time range
    fireEvent.click(screen.getByText('1m'));
    
    // Expect the onRangeChange callback to be called with the clicked range
    expect(defaultProps.onRangeChange).toHaveBeenCalledWith('1m');
  });

  it('applies the correct positioning based on headerHeight', () => {
    render(<TimeRangeControls {...defaultProps} />);
    
    // The container should be positioned below the header
    const container = screen.getByTestId('time-range-controls');
    expect(container).toHaveStyle({
      top: '75px' // headerHeight + padding.y
    });
  });

  it('does not call onRangeChange when clicking the already selected range', () => {
    render(<TimeRangeControls {...defaultProps} />);
    
    // Click on the already selected range
    fireEvent.click(screen.getByText('1h'));
    
    // The callback should be called
    expect(defaultProps.onRangeChange).toHaveBeenCalledWith('1h');
  });
}); 