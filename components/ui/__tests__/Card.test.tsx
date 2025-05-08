import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText('Card Content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom Card</Card>);
    expect(screen.getByText('Custom Card')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Card ref={ref}>Ref Card</Card>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders with different content types', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('maintains proper styling with nested elements', () => {
    render(
      <Card>
        <div className="p-4">
          <h2 className="text-xl">Nested Content</h2>
        </div>
      </Card>
    );
    
    const card = screen.getByText('Nested Content').closest('div');
    expect(card).toHaveClass('p-4');
  });

  it('handles empty content', () => {
    render(<Card />);
    const card = screen.getByRole('generic');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg');
  });
}); 