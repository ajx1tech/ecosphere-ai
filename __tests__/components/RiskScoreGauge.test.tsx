import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskScoreGauge from '../../src/components/RiskScoreGauge';

describe('RiskScoreGauge Component', () => {
  it('renders with correct aria attributes and role', () => {
    render(<RiskScoreGauge score={75} category="Low" />);
    
    const gauge = screen.getByRole('meter');
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveAttribute('aria-valuenow', '75');
    expect(gauge).toHaveAttribute('aria-valuemin', '0');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays category text', () => {
    render(<RiskScoreGauge score={25} category="High" />);
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
  });
});
