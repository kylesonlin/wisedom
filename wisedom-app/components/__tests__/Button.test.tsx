import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { renderWithProviders } from '@/utils/test-utils';

describe('Button', () => {
  it('renders correctly', () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    renderWithProviders(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
  });

  it('shows loading state', () => {
    renderWithProviders(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveAttribute('aria-busy', 'true');
  });

  it('applies variant styles', () => {
    const { rerender } = renderWithProviders(<Button variant="default">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('bg-secondary');

    rerender(<Button variant="destructive">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('bg-destructive');
  });

  it('applies size styles', () => {
    const { rerender } = renderWithProviders(<Button size="sm">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('text-sm');

    rerender(<Button size="default">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('text-base');

    rerender(<Button size="lg">Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('text-lg');
  });
}); 