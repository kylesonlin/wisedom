import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Suggestion } from './AIActionSuggestions';
import AIActionSuggestions from './AIActionSuggestions';

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    contactId: 'contact-1',
    contactName: 'John Doe',
    type: 'meeting',
    priority: 'high',
    reason: 'Based on recent interactions, it might be good to schedule a follow-up meeting with the client.',
    suggestedAction: 'Schedule a follow-up meeting',
    suggestedTime: new Date(),
    confidence: 0.9
  },
  {
    id: '2',
    contactId: 'contact-2',
    contactName: 'Jane Smith',
    type: 'email',
    priority: 'medium',
    reason: 'The project timeline needs to be updated to reflect recent changes.',
    suggestedAction: 'Send an email with updated timeline',
    suggestedTime: new Date(),
    confidence: 0.7
  },
  {
    id: '3',
    contactId: 'contact-3',
    contactName: 'Bob Wilson',
    type: 'call',
    priority: 'low',
    reason: 'Some documentation needs to be reviewed for accuracy.',
    suggestedAction: 'Schedule a call to review documentation',
    suggestedTime: new Date(),
    confidence: 0.5
  }
];

describe('AIActionSuggestions', () => {
  it('renders the component title correctly', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('renders the refresh button', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('renders all suggestions with correct data', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    
    // Check for all suggestion titles
    expect(screen.getByText('Schedule a follow-up meeting')).toBeInTheDocument();
    expect(screen.getByText('Send an email with updated timeline')).toBeInTheDocument();
    expect(screen.getByText('Schedule a call to review documentation')).toBeInTheDocument();
  });

  it('renders priority badges with correct styling', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    
    const highPriority = screen.getByText('high');
    const mediumPriority = screen.getByText('medium');
    const lowPriority = screen.getByText('low');
    
    expect(highPriority).toHaveClass('bg-red-100', 'text-red-800');
    expect(mediumPriority).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(lowPriority).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders action buttons for each suggestion', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    
    const acceptButtons = screen.getAllByText('Accept');
    const dismissButtons = screen.getAllByText('Dismiss');
    
    expect(acceptButtons).toHaveLength(mockSuggestions.length);
    expect(dismissButtons).toHaveLength(mockSuggestions.length);
  });

  it('applies correct styling to suggestion cards', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    
    const cards = screen.getAllByText(/Schedule a follow-up meeting|Send an email with updated timeline|Schedule a call to review documentation/)
      .map(element => element.closest('div[class*="p-3"]'));
    
    cards.forEach(card => {
      expect(card).toHaveClass('p-3', 'rounded-md', 'border-[hsl(var(--border))]', 'bg-background');
    });
  });

  it('applies correct text styling to titles and descriptions', () => {
    render(<AIActionSuggestions suggestions={mockSuggestions} onActionSelect={() => {}} />);
    
    const titles = screen.getAllByRole('heading', { level: 4 });
    const descriptions = screen.getAllByText(/Based on recent interactions|The project timeline needs to be updated|Some documentation needs to be reviewed/);
    
    titles.forEach(title => {
      expect(title).toHaveClass('text-sm', 'font-medium');
    });
    
    descriptions.forEach(description => {
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });
}); 