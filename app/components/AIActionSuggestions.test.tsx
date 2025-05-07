import { render, screen, fireEvent } from '@testing-library/react';
import { AIActionSuggestions } from './AIActionSuggestions';

describe('AIActionSuggestions', () => {
  it('renders the component title correctly', () => {
    render(<AIActionSuggestions />);
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('renders the view all button', () => {
    render(<AIActionSuggestions />);
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
  });

  it('renders all suggestions with correct data', () => {
    render(<AIActionSuggestions />);
    
    // Check for all suggestion titles
    expect(screen.getByText('Schedule Coffee Meeting')).toBeInTheDocument();
    expect(screen.getByText('Follow up on Project Proposal')).toBeInTheDocument();
    expect(screen.getByText('Update LinkedIn Profile')).toBeInTheDocument();
    
    // Check for all descriptions
    expect(screen.getByText(/Based on your recent interaction with Sarah/)).toBeInTheDocument();
    expect(screen.getByText(/It's been 5 days since you sent the proposal/)).toBeInTheDocument();
    expect(screen.getByText(/Your profile hasn't been updated in 3 months/)).toBeInTheDocument();
  });

  it('renders type badges with correct styling', () => {
    render(<AIActionSuggestions />);
    
    const meetingBadge = screen.getByText('meeting');
    const followUpBadge = screen.getByText('follow-up');
    const taskBadge = screen.getByText('task');
    
    expect(meetingBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(followUpBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    expect(taskBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders action buttons for each suggestion', () => {
    render(<AIActionSuggestions />);
    
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    const takeActionButtons = screen.getAllByRole('button', { name: /take action/i });
    
    expect(dismissButtons).toHaveLength(3);
    expect(takeActionButtons).toHaveLength(3);
    
    dismissButtons.forEach(button => {
      expect(button).toHaveClass('variant-ghost');
    });
    
    takeActionButtons.forEach(button => {
      expect(button).toHaveClass('variant-primary');
    });
  });

  it('applies correct styling to suggestion cards', () => {
    render(<AIActionSuggestions />);
    
    const suggestionCards = screen.getAllByRole('article');
    suggestionCards.forEach(card => {
      expect(card).toHaveClass('p-3', 'bg-gray-50', 'rounded-lg');
    });
  });

  it('applies correct text styling to titles and descriptions', () => {
    render(<AIActionSuggestions />);
    
    const titles = screen.getAllByRole('heading', { level: 4 });
    const descriptions = screen.getAllByText(/Based on|It's been|Your profile/);
    
    titles.forEach(title => {
      expect(title).toHaveClass('font-medium', 'text-sm');
    });
    
    descriptions.forEach(description => {
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });
  });
}); 