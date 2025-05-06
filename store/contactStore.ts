import { create } from 'zustand';
import { Contact } from '../types/contact';

interface ContactStore {
  contacts: Contact[];
  addContacts: (newContacts: Contact[]) => Promise<void>;
  updateContact: (id: string, contact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactStore = create<ContactStore>()((set) => ({
  contacts: [],
  addContacts: async (newContacts: Contact[]) => {
    set((state) => ({
      contacts: [...state.contacts, ...newContacts]
    }));
  },
  updateContact: async (id: string, contact: Contact) => {
    set((state) => ({
      contacts: state.contacts.map((c: Contact) => (c.id === id ? { ...c, ...contact } : c))
    }));
  },
  deleteContact: async (id: string) => {
    set((state) => ({
      contacts: state.contacts.filter((c: Contact) => c.id !== id)
    }));
  }
})); 