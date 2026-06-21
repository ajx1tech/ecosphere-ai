import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingWizard from '../../src/components/OnboardingWizard';

describe('OnboardingWizard Component', () => {
  it('renders the first step on mount', () => {
    render(<OnboardingWizard onComplete={jest.fn()} />);
    expect(screen.getByText(/How do you primarily commute\?/i)).toBeInTheDocument();
  });

  it('Next button advances step', async () => {
    render(<OnboardingWizard onComplete={jest.fn()} />);
    const nextButton = screen.getByRole('button', { name: /Go to next step/i });
    
    await userEvent.click(nextButton);
    expect(await screen.findByText(/What is your typical diet\?/i)).toBeInTheDocument();
  });

  it('invalid input (negative number) limits to 0', async () => {
    render(<OnboardingWizard onComplete={jest.fn()} />);
    const distanceInput = screen.getByLabelText(/Daily Commute Distance/i);
    
    await userEvent.clear(distanceInput);
    await userEvent.clear(distanceInput);
    fireEvent.change(distanceInput, { target: { value: '-5' } });
    
    // React's onChange bounds logic sets it to 0
    expect(distanceInput).toHaveValue(0);
  });

  it('final step shows "Calculate My Footprint" button', async () => {
    render(<OnboardingWizard onComplete={jest.fn()} />);
    
    // Click through to step 6 (index 5)
    for (let i = 0; i < 5; i++) {
      const nextBtn = screen.getByRole('button', { name: /Go to next step/i });
      await userEvent.click(nextBtn);
    }
    
    expect(await screen.findByRole('button', { name: /Calculate my footprint/i })).toBeInTheDocument();
  });

  it('aria-live region updates on step change', async () => {
    render(<OnboardingWizard onComplete={jest.fn()} />);
    
    // Initially on step 1
    let liveRegion = screen.getByText(/Now on step 1/i);
    expect(liveRegion).toBeInTheDocument();
    
    const nextButton = screen.getByRole('button', { name: /Go to next step/i });
    await userEvent.click(nextButton);
    
    liveRegion = await screen.findByText(/Now on step 2/i);
    expect(liveRegion).toBeInTheDocument();
  });
});
