import { render, screen, fireEvent } from '@testing-library/react';
import { ContactCard } from './ContactCard';

describe('ContactCard', () => {
  const mockProps = {
    id: 'test-id',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders contact information correctly', () => {
    render(<ContactCard {...mockProps} />);
    
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.email)).toBeInTheDocument();
  });

  it('renders action buttons correctly', () => {
    render(<ContactCard {...mockProps} />);
    
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('applies correct styling to elements', () => {
    render(<ContactCard {...mockProps} />);
    
    const nameElement = screen.getByText(mockProps.name);
    const emailElement = screen.getByText(mockProps.email);
    
    expect(nameElement).toHaveClass('font-medium');
    expect(emailElement).toHaveClass('text-sm', 'text-gray-500');
  });

  it('renders buttons with correct styling', () => {
    render(<ContactCard {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('text-sm', 'text-blue-600', 'hover:text-blue-700');
    });
  });

  it('handles button click events', () => {
    const onViewProfile = jest.fn();
    const onMessage = jest.fn();
    
    render(
      <ContactCard
        {...mockProps}
        onViewProfile={onViewProfile}
        onMessage={onMessage}
      />
    );
    
    fireEvent.click(screen.getByText('View Profile'));
    expect(onViewProfile).toHaveBeenCalledWith(mockProps.id);
    
    fireEvent.click(screen.getByText('Message'));
    expect(onMessage).toHaveBeenCalledWith(mockProps.id);
  });

  it('handles missing optional props', () => {
    render(<ContactCard id={mockProps.id} name={mockProps.name} />);
    
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.queryByText(mockProps.email)).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ContactCard {...mockProps} className="custom-class" />);
    expect(screen.getByTestId('contact-card')).toHaveClass('custom-class');
  });

  it('handles long text content', () => {
    const longName = 'John Doe with a very long name that might need truncation';
    const longEmail = 'john.doe.with.a.very.long.email.address@example.com';
    
    render(
      <ContactCard
        id={mockProps.id}
        name={longName}
        email={longEmail}
      />
    );
    
    expect(screen.getByText(longName)).toBeInTheDocument();
    expect(screen.getByText(longEmail)).toBeInTheDocument();
  });

  it('maintains accessibility', () => {
    render(<ContactCard {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
}); 