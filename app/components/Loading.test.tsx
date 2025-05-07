import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders the loading spinner', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'border-b-2', 'border-blue-600');
  });

  it('has correct dimensions', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('is centered in container', () => {
    render(<Loading />);
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    expect(container).toHaveClass('min-h-[200px]');
  });

  it('maintains accessibility standards', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
}); 