import { Contact } from '../types/contact';

interface FileFormatHandler {
  parse: (content: string) => Contact[];
  validate: (content: string) => boolean;
}

// CSV Handler
const csvHandler: FileFormatHandler = {
  parse: (content: string): Contact[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const contact: Contact = { name: '' };
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;
        
        switch (header) {
          case 'name':
            contact.name = value;
            break;
          case 'email':
            contact.email = value;
            break;
          case 'phone':
            contact.phone = value;
            break;
          case 'company':
            contact.company = value;
            break;
          case 'title':
            contact.title = value;
            break;
          default:
            if (!contact.additionalFields) {
              contact.additionalFields = {};
            }
            contact.additionalFields[header] = value;
        }
      });
      
      return contact;
    });
  },
  
  validate: (content: string): boolean => {
    const lines = content.split('\n');
    if (lines.length < 2) return false;
    
    const headers = lines[0].split(',').map(h => h.trim());
    return headers.length > 0 && headers.some(h => h.toLowerCase() === 'name');
  }
};

// JSON Handler
const jsonHandler: FileFormatHandler = {
  parse: (content: string): Contact[] => {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name || '',
          email: item.email,
          phone: item.phone,
          company: item.company,
          title: item.title,
          additionalFields: item.additionalFields || {}
        }));
      }
      return [];
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return [];
    }
  },
  
  validate: (content: string): boolean => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) && data.length > 0;
    } catch (e) {
      return false;
    }
  }
};

// vCard Handler
const vCardHandler: FileFormatHandler = {
  parse: (content: string): Contact[] => {
    const contacts: Contact[] = [];
    const vCards = content.split('BEGIN:VCARD');
    
    for (const vCard of vCards) {
      if (!vCard.trim()) continue;
      
      const contact: Contact = { name: '' };
      const lines = vCard.split('\n');
      
      for (const line of lines) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (!key || !value) continue;
        
        switch (key.toUpperCase()) {
          case 'FN':
            contact.name = value;
            break;
          case 'EMAIL':
            contact.email = value;
            break;
          case 'TEL':
            contact.phone = value;
            break;
          case 'ORG':
            contact.company = value;
            break;
          case 'TITLE':
            contact.title = value;
            break;
          default:
            if (!contact.additionalFields) {
              contact.additionalFields = {};
            }
            contact.additionalFields[key] = value;
        }
      }
      
      if (contact.name) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  },
  
  validate: (content: string): boolean => {
    return content.includes('BEGIN:VCARD') && content.includes('END:VCARD');
  }
};

// File format detection
export const detectFileFormat = (file: File): string | null => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) return 'csv';
  if (fileName.endsWith('.json')) return 'json';
  if (fileName.endsWith('.vcf') || fileName.endsWith('.vcard')) return 'vcard';
  
  return null;
};

// Get appropriate handler
export const getFileHandler = (format: string): FileFormatHandler | null => {
  switch (format.toLowerCase()) {
    case 'csv':
      return csvHandler;
    case 'json':
      return jsonHandler;
    case 'vcard':
      return vCardHandler;
    default:
      return null;
  }
};

// Parse file content
export const parseFileContent = async (
  file: File,
  format?: string
): Promise<Contact[]> => {
  const content = await file.text();
  const detectedFormat = format || detectFileFormat(file);
  
  if (!detectedFormat) {
    throw new Error('Unsupported file format');
  }
  
  const handler = getFileHandler(detectedFormat);
  if (!handler) {
    throw new Error('No handler found for the file format');
  }
  
  if (!handler.validate(content)) {
    throw new Error('Invalid file format or content');
  }
  
  return handler.parse(content);
}; 