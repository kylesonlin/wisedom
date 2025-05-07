import { render, screen, fireEvent } from '@testing-library/react';
import { ActionItems } from './ActionItems';

describe('ActionItems', () => {
  it('renders the component title correctly', () => {
    render(<ActionItems />);
    expect(screen.getByText('Action Items')).toBeInTheDocument();
  });

  it('renders the add new button', () => {
    render(<ActionItems />);
    expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument();
  });

  it('renders all action items with correct data', () => {
    render(<ActionItems />);
    
    // Check for all action item titles
    expect(screen.getByText('Follow up with John about project proposal')).toBeInTheDocument();
    expect(screen.getByText('Schedule team meeting')).toBeInTheDocument();
    expect(screen.getByText('Review quarterly report')).toBeInTheDocument();
    
    // Check for all due dates
    expect(screen.getByText('Due: 2024-03-20')).toBeInTheDocument();
    expect(screen.getByText('Due: 2024-03-22')).toBeInTheDocument();
    expect(screen.getByText('Due: 2024-03-25')).toBeInTheDocument();
  });

  it('renders priority badges with correct styling', () => {
    render(<ActionItems />);
    
    const highPriority = screen.getByText('high');
    const mediumPriority = screen.getByText('medium');
    const lowPriority = screen.getByText('low');
    
    expect(highPriority).toHaveClass('bg-red-100', 'text-red-800');
    expect(mediumPriority).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(lowPriority).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders checkboxes with correct states', () => {
    render(<ActionItems />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    
    // Check the completed state of the last item
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('applies correct styling to completed items', () => {
    render(<ActionItems />);
    
    const completedItem = screen.getByText('Review quarterly report');
    expect(completedItem).toHaveClass('line-through', 'text-gray-500');
  });

  it('applies hover effect to action items', () => {
    render(<ActionItems />);
    
    const actionItems = screen.getAllByRole('listitem');
    actionItems.forEach(item => {
      expect(item).toHaveClass('hover:bg-gray-50');
    });
  });
}); 