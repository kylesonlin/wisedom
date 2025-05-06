'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import ContactForm from '@/components/ContactForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  additionalFields?: Record<string, any>;
}

export default function RolodexClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('lastName', { ascending: true });

      if (error) throw error;

      const normalizedContacts = data.map((contact: any) => ({
        ...contact,
        createdAt: contact.createdAt || contact.created_at,
        updatedAt: contact.updatedAt || contact.updated_at,
      }));

      setContacts(normalizedContacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = () => {
    setSelectedContact(undefined);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== contactId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContact(undefined);
  };

  const handleContactSuccess = () => {
    fetchContacts();
    handleModalClose();
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.title?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <div>Loading contacts...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleAddContact}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {contact.firstName} {contact.lastName}
                </h3>
                {contact.title && contact.company && (
                  <p className="text-gray-600 text-sm">
                    {contact.title} at {contact.company}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="text-gray-500">Email:</span>{' '}
                <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline">
                  {contact.email}
                </a>
              </p>
              {contact.phone && (
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span>{' '}
                  <a href={`tel:${contact.phone}`} className="text-blue-500 hover:underline">
                    {contact.phone}
                  </a>
                </p>
              )}
            </div>
            {contact.notes && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleEditContact(contact)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
      >
        <ContactForm
          contact={selectedContact}
          onSuccess={handleContactSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
} 