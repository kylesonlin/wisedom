import { Contact } from '../types/contact';

interface NormalizedContact extends Contact {
  normalizedEmail?: string;
  normalizedPhone?: string;
  normalizedName?: string;
  source?: string;
  confidence?: number;
}

// Helper function to clean and standardize email addresses
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// Helper function to clean and standardize phone numbers
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
};

// Helper function to clean and standardize names
export const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, ''); // Remove special characters
};

// Function to calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
};

// Helper function to calculate edit distance
const editDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

// Function to detect potential duplicates
export const findPotentialDuplicates = (
  contacts: Contact[],
  threshold = 0.8
): Map<string, Contact[]> => {
  const normalizedContacts = contacts.map(contact => ({
    ...contact,
    normalizedEmail: normalizeEmail(contact.email),
    normalizedPhone: normalizePhone(contact.phone),
    normalizedName: normalizeName(contact.name)
  }));

  const duplicates = new Map<string, Contact[]>();

  for (let i = 0; i < normalizedContacts.length; i++) {
    const current = normalizedContacts[i];
    const currentKey = `${current.normalizedEmail}-${current.normalizedPhone}-${current.normalizedName}`;
    
    if (!duplicates.has(currentKey)) {
      duplicates.set(currentKey, [current]);
    }

    for (let j = i + 1; j < normalizedContacts.length; j++) {
      const other = normalizedContacts[j];
      
      // Check email similarity
      const emailSimilarity = current.normalizedEmail && other.normalizedEmail
        ? calculateSimilarity(current.normalizedEmail, other.normalizedEmail)
        : 0;

      // Check phone similarity
      const phoneSimilarity = current.normalizedPhone && other.normalizedPhone
        ? calculateSimilarity(current.normalizedPhone, other.normalizedPhone)
        : 0;

      // Check name similarity
      const nameSimilarity = current.normalizedName && other.normalizedName
        ? calculateSimilarity(current.normalizedName, other.normalizedName)
        : 0;

      // Calculate overall similarity
      const overallSimilarity = Math.max(emailSimilarity, phoneSimilarity, nameSimilarity);

      if (overallSimilarity >= threshold) {
        const existingGroup = duplicates.get(currentKey);
        if (existingGroup && !existingGroup.includes(other)) {
          existingGroup.push(other);
        }
      }
    }
  }

  // Filter out non-duplicates (groups with only one contact)
  const filteredDuplicates = new Map<string, Contact[]>();
  for (const [key, group] of duplicates.entries()) {
    if (group.length > 1) {
      filteredDuplicates.set(key, group);
    }
  }

  return filteredDuplicates;
};

// Function to merge duplicate contacts
export const mergeDuplicateContacts = (duplicates: Contact[]): Contact => {
  if (duplicates.length === 0) {
    throw new Error('No contacts to merge');
  }

  // Start with the first contact as base
  const merged: Contact = { ...duplicates[0] };

  // Merge additional data from other contacts
  for (let i = 1; i < duplicates.length; i++) {
    const current = duplicates[i];
    
    // Merge emails if different
    if (current.email && current.email !== merged.email) {
      merged.email = merged.email
        ? `${merged.email}, ${current.email}`
        : current.email;
    }

    // Merge phones if different
    if (current.phone && current.phone !== merged.phone) {
      merged.phone = merged.phone
        ? `${merged.phone}, ${current.phone}`
        : current.phone;
    }

    // Merge names if different
    if (current.name && current.name !== merged.name) {
      merged.name = merged.name
        ? `${merged.name} (${current.name})`
        : current.name;
    }

    // Merge additional fields if they exist
    if (current.additionalFields) {
      merged.additionalFields = {
        ...merged.additionalFields,
        ...current.additionalFields
      };
    }
  }

  return merged;
};

// Function to normalize a single contact
export const normalizeContact = (contact: Contact): NormalizedContact => {
  return {
    ...contact,
    email: normalizeEmail(contact.email),
    phone: normalizePhone(contact.phone),
    name: normalizeName(contact.name),
    normalizedEmail: normalizeEmail(contact.email),
    normalizedPhone: normalizePhone(contact.phone),
    normalizedName: normalizeName(contact.name)
  };
};

// Function to normalize a batch of contacts
export const normalizeContacts = (contacts: Contact[]): NormalizedContact[] => {
  return contacts.map(normalizeContact);
}; 