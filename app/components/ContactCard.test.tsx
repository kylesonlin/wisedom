import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactCard from './ContactCard';

describe('ContactCard', () => {
  const mockProps = {
    id: 'test-id',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc',
    role: 'Software Engineer',
    lastContact: '2024-03-15',
    nextFollowUp: '2024-03-22',
    tags: ['developer', 'frontend'],
    priority: 'high' as const
  };

  it('renders contact information correctly', () => {
    render(<ContactCard {...mockProps} />);
    
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.email)).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.role} at ${mockProps.company}`)).toBeInTheDocument();
  });

  it('renders action buttons correctly', () => {
    render(<ContactCard {...mockProps} />);
    
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('applies correct styling to elements', () => {
    render(<ContactCard {...mockProps} />);
    
    const nameElement = screen.getByText(mockProps.name);
    const emailElement = screen.getByText(mockProps.email);
    
    expect(nameElement).toHaveClass('text-lg', 'font-semibold');
    expect(emailElement).toHaveClass('text-sm');
  });

  it('renders buttons with correct styling', () => {
    render(<ContactCard {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('text-sm', 'font-medium');
    });
  });

  it('handles missing optional props', () => {
    render(<ContactCard {...mockProps} tags={[]} />);
    
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.email)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ContactCard {...mockProps} />);
    expect(screen.getByText(mockProps.name).closest('div')).toHaveClass('rounded-lg', 'border');
  });

  it('handles long text content', () => {
    const longName = 'John Doe with a very long name that might need truncation';
    const longEmail = 'john.doe.with.a.very.long.email.address@example.com';
    
    render(
      <ContactCard
        {...mockProps}
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
      expect(button).toBeInTheDocument();
    });
  });
}); 