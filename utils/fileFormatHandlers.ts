import { Contact } from '../types/contact';

interface FileFormatHandler {
  parse: (content: string) => Contact[];
  validate: (content: string) => boolean;
}

// CSV Handler
const csvHandler: FileFormatHandler = {
  parse: (content: string): Contact[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h?.trim().toLowerCase() ?? '');
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const contact: Partial<Contact> = {
        id: crypto.randomUUID(),
        firstName: '',
        lastName: '',
        email: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;
        
        switch (header) {
          case 'firstname':
          case 'first_name':
            contact.firstName = value;
            break;
          case 'lastname':
          case 'last_name':
            contact.lastName = value;
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
          case 'birthday':
            contact.birthday = new Date(value);
            break;
          case 'relationshipstrength':
            contact.relationshipStrength = parseFloat(value);
            break;
          case 'assignedto':
            contact.assignedTo = value;
            break;
          case 'tags':
            contact.tags = value.split(';').map(tag => tag.trim());
            break;
          case 'notes':
            contact.notes = value;
            break;
        }
      });
      
      return contact as Contact;
    });
  },
  
  validate: (content: string): boolean => {
    const lines = content.split('\n');
    if (lines.length < 2) return false;
    
    const headers = lines[0].split(',').map(h => h?.trim().toLowerCase() ?? '');
    return headers.length > 0 && (
      headers.some(h => h?.toLowerCase() === 'firstname') || 
      headers.some(h => h?.toLowerCase() === 'lastName')
    );
  }
};

// JSON Handler
const jsonHandler: FileFormatHandler = {
  parse: (content: string): Contact[] => {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: crypto.randomUUID(),
          firstName: item.name || '',
          lastName: '',
          email: item.email || '',
          phone: item.phone,
          company: item.company,
          title: item.title,
          birthday: item.birthday,
          relationshipStrength: item.relationshipStrength,
          assignedTo: item.assignedTo,
          tags: item.tags,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date()
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
      
      const contact: Partial<Contact> = {
        id: crypto.randomUUID(),
        firstName: '',
        lastName: '',
        email: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const lines = vCard.split('\n');
      for (const line of lines) {
        const [key, value] = line.split(':');
        if (!key || !value) continue;
        
        switch (key.toUpperCase()) {
          case 'FN':
            if (value.includes(' ')) {
              const [firstName, ...rest] = value.split(' ');
              contact.firstName = firstName;
              contact.lastName = rest.join(' ');
            } else {
              contact.firstName = value;
              contact.lastName = '';
            }
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
          case 'BDAY':
            contact.birthday = new Date(value);
            break;
          case 'NOTE':
            contact.notes = value;
            break;
        }
      }
      
      contacts.push(contact as Contact);
    }
    
    return contacts;
  },
  
  validate: (content: string): boolean => {
    return content.includes('BEGIN:VCARD') && content.includes('END:VCARD');
  }
};

// File format detection
export const detectFileFormat = (content: string): 'csv' | 'json' | 'vcard' | null => {
  if (csvHandler.validate(content)) return 'csv';
  if (jsonHandler.validate(content)) return 'json';
  if (vCardHandler.validate(content)) return 'vcard';
  return null;
};

// Get appropriate handler
export const getFileHandler = (format: string): FileFormatHandler | null => {
  switch (format) {
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
export const parseFileContent = (
  content: string,
  format?: string
): Contact[] => {
  const detectedFormat = format || detectFileFormat(content);
  if (!detectedFormat) {
    throw new Error('Could not detect file format');
  }

  const handler = getFileHandler(detectedFormat);
  if (!handler) {
    throw new Error(`No handler found for format: ${detectedFormat}`);
  }

  return handler.parse(content);
}; 