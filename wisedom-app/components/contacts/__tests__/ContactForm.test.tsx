import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../ContactForm';
import { ContactsService } from '@/services/contacts';
import '@testing-library/jest-dom';

// Mock the ContactsService
jest.mock('@/services/contacts', () => ({
  ContactsService: {
    createContact: jest.fn(),
    updateContact: jest.fn(),
  },
}));

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn();
  const mockContact = {
    id: '123',
    user_id: 'user123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    company: 'Acme Inc',
    title: 'Developer',
    notes: 'Some notes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<ContactForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Create New Contact')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /phone/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create contact/i })).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    render(<ContactForm mode="edit" initialData={mockContact} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Edit Contact')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toHaveValue('John');
    expect(screen.getByRole('textbox', { name: /last name/i })).toHaveValue('Doe');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('john@example.com');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('handles form submission for create mode', async () => {
    (ContactsService.createContact as jest.Mock).mockResolvedValueOnce(mockContact);
    render(<ContactForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByRole('textbox', { name: /first name/i }), 'John');
      await userEvent.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe');
      await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com');
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create contact/i }));
    });

    expect(ContactsService.createContact).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '',
      company: '',
      title: '',
      notes: '',
    });

    expect(await screen.findByText('Contact successfully created!')).toBeInTheDocument();
    expect(mockOnSubmit).toHaveBeenCalledWith(mockContact);
  });

  it('handles form submission for edit mode', async () => {
    const updatedContact = {
      ...mockContact,
      first_name: 'Jane',
    };
    (ContactsService.updateContact as jest.Mock).mockResolvedValueOnce(updatedContact);

    render(<ContactForm mode="edit" initialData={mockContact} onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.clear(screen.getByRole('textbox', { name: /first name/i }));
      await userEvent.type(screen.getByRole('textbox', { name: /first name/i }), 'Jane');
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });

    // Verify the service was called with the correct data, excluding timestamps and user_id
    const { created_at, updated_at, user_id, ...expectedData } = mockContact;
    expect(ContactsService.updateContact).toHaveBeenCalledWith({
      ...expectedData,
      first_name: 'Jane',
    });

    expect(await screen.findByText('Contact successfully updated!')).toBeInTheDocument();
    expect(mockOnSubmit).toHaveBeenCalledWith(updatedContact);
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Failed to create contact';
    (ContactsService.createContact as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<ContactForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByRole('textbox', { name: /first name/i }), 'John');
      await userEvent.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe');
      await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com');
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create contact/i }));
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
}); 