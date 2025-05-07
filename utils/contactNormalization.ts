import { Contact } from '../types/contact';

export interface NormalizedContact extends Omit<Contact, 'email' | 'phone' | 'firstName' | 'lastName'> {
  email: string;
  normalizedEmail: string;
  phone?: string;
  normalizedPhone?: string;
  firstName?: string;
  lastName?: string;
  normalizedName?: string;
  source: string;
  confidence: number;
  normalizationTimestamp: Date;
  originalValues: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}

// Helper function to clean and standardize email addresses
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

// Helper function to clean and standardize phone numbers
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone
    .replace(/[^\d+]/g, '')
    .toLowerCase();
}

// Helper function to clean and standardize names
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

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
  const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
  const normalizedContacts = contacts.map(contact => ({
    ...contact,
    normalizedEmail: normalizeEmail(contact.email ? contact.email : ''),
    normalizedPhone: normalizePhone(contact.phone ? contact.phone : ''),
    normalizedName: normalizeName(getFullName(contact)),
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
  for (const [key, group] of Array.from(duplicates.entries())) {
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
    if (current.firstName && current.lastName && (current.firstName !== merged.firstName || current.lastName !== merged.lastName)) {
      merged.firstName = merged.firstName || current.firstName;
      merged.lastName = merged.lastName || current.lastName;
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
  const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
  const normalizedName = normalizeName(getFullName(contact));
  
  return {
    ...contact,
    email: normalizeEmail(contact.email ? contact.email : ''),
    phone: contact.phone ? normalizePhone(contact.phone) : undefined,
    firstName: contact.firstName,
    lastName: contact.lastName,
    normalizedEmail: normalizeEmail(contact.email ? contact.email : ''),
    normalizedPhone: contact.phone ? normalizePhone(contact.phone) : undefined,
    normalizedName,
    source: contact.source || 'manual',
    confidence: 1.0,
    normalizationTimestamp: new Date(),
    originalValues: {
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName
    }
  };
};

// Function to normalize a batch of contacts
export const normalizeContacts = (contacts: Contact[]): NormalizedContact[] => {
  return contacts.map(normalizeContact);
};

// ... existing code ...
      // if (analysis && 'relationshipStrength' in analysis) {
      //   normalizedAnalysis.relationshipStrength = (analysis.relationshipStrength as number);
      // }
// ... existing code ... 

export function areNamesSimilar(str1: string, str2: string): boolean {
  if (!str1 || !str2) return false;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  return s1 === s2 || s1.includes(s2) || s2.includes(s1);
}

export function normalizeCompany(company: string): string {
  if (!company) return '';
  let s1 = company.trim();
  let s2 = company.trim();
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  return s1 === s2 ? s1 : company;
} 