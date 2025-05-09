import { supabase } from '@/utils/supabase';

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
}

export class ContactsService {
  static async getContacts(options?: {
    search?: string;
    company?: string;
    orderBy?: keyof Contact;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase.from('contacts').select('*');

      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      if (options?.company) {
        query = query.eq('company', options.company);
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection === 'asc',
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Contact[];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  static async getContactById(id: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  static async createContact(input: CreateContactInput) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  static async updateContact(input: UpdateContactInput) {
    try {
      const { id, ...updateData } = input;
      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  static async deleteContact(id: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  static async getContactsByCompany(company: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company', company)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Contact[];
    } catch (error) {
      console.error('Error fetching contacts by company:', error);
      throw error;
    }
  }

  static async searchContacts(query: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Contact[];
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
} 