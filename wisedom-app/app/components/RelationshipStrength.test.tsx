import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelationshipStrength from './RelationshipStrength';

describe('RelationshipStrength', () => {
  it('renders the component title correctly', () => {
    render(<RelationshipStrength />);
    expect(screen.getByText('Relationship Strength')).toBeInTheDocument();
  });

  it('renders all relationship metrics', () => {
    render(<RelationshipStrength />);
    
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Trust')).toBeInTheDocument();
  });

  it('displays correct percentage values', () => {
    render(<RelationshipStrength />);
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders progress bars with correct styling', () => {
    render(<RelationshipStrength />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(3);
    
    progressBars.forEach(bar => {
      expect(bar).toHaveClass('bg-gray-200', 'rounded-full', 'h-2');
    });
  });

  it('renders progress indicators with correct widths', () => {
    render(<RelationshipStrength />);
    
    const progressIndicators = screen.getAllByRole('progressbar').map(
      element => element.querySelector('div')
    );
    
    expect(progressIndicators[0]).toHaveStyle({ width: '85%' });
    expect(progressIndicators[1]).toHaveStyle({ width: '60%' });
    expect(progressIndicators[2]).toHaveStyle({ width: '75%' });
  });

  it('applies correct text styling to labels and values', () => {
    render(<RelationshipStrength />);
    
    const labels = screen.getAllByText(/Professional|Personal|Trust/);
    const values = screen.getAllByText(/85%|60%|75%/);
    
    labels.forEach(label => {
      expect(label).toHaveClass('text-sm');
    });
    
    values.forEach(value => {
      expect(value).toHaveClass('text-sm');
    });
  });
}); 