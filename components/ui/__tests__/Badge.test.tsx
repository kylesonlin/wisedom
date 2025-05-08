import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('handles different colors', () => {
    const { rerender } = render(<Badge color="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-500');

    rerender(<Badge color="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-500');

    rerender(<Badge color="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-500');
  });

  it('renders with icon', () => {
    render(
      <Badge icon={<span data-testid="icon">★</span>}>
        With Icon
      </Badge>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longText = 'This is a very long badge text that might need truncation';
    render(<Badge>{longText}</Badge>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('maintains accessibility', () => {
    render(<Badge aria-label="Status">Active</Badge>);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });
}); 