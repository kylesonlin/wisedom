import { Contact } from '../types/contact';
import { normalizeEmail, normalizePhone, normalizeName } from './contactNormalization';

interface ContactFeatures {
  emailSimilarity: number;
  phoneSimilarity: number;
  nameSimilarity: number;
  companySimilarity: number;
  titleSimilarity: number;
  phoneticNameSimilarity: number;
  emailDomainSimilarity: number;
  nameTokenSimilarity: number;
}

interface ContactPair {
  contact1: Contact;
  contact2: Contact;
  features: ContactFeatures;
  similarityScore: number;
}

// Feature extraction functions
const extractFeatures = (contact1: Contact, contact2: Contact): ContactFeatures => {
  return {
    emailSimilarity: calculateEmailSimilarity(contact1.email, contact2.email),
    phoneSimilarity: calculatePhoneSimilarity(contact1.phone, contact2.phone),
    nameSimilarity: calculateNameSimilarity(getFullName(contact1), getFullName(contact2)),
    companySimilarity: calculateCompanySimilarity(contact1.company, contact2.company),
    titleSimilarity: calculateTitleSimilarity(contact1.title, contact2.title),
    phoneticNameSimilarity: calculatePhoneticSimilarity(getFullName(contact1), getFullName(contact2)),
    emailDomainSimilarity: calculateEmailDomainSimilarity(contact1.email, contact2.email),
    nameTokenSimilarity: calculateNameTokenSimilarity(getFullName(contact1), getFullName(contact2))
  };
};

// Similarity calculation functions
const calculateEmailSimilarity = (email1?: string, email2?: string): number => {
  if (!email1 || !email2) return 0;
  const normEmail1 = normalizeEmail(email1);
  const normEmail2 = normalizeEmail(email2);
  return normEmail1 === normEmail2 ? 1 : 0;
};

const calculatePhoneSimilarity = (phone1?: string, phone2?: string): number => {
  if (!phone1 || !phone2) return 0;
  const normPhone1 = normalizePhone(phone1);
  const normPhone2 = normalizePhone(phone2);
  return normPhone1 === normPhone2 ? 1 : 0;
};

const calculateNameSimilarity = (name1: string, name2: string): number => {
  const normName1 = normalizeName(name1);
  const normName2 = normalizeName(name2);
  return calculateLevenshteinSimilarity(normName1, normName2);
};

const calculateCompanySimilarity = (company1?: string, company2?: string): number => {
  if (!company1 || !company2) return 0;
  const normCompany1 = normalizeName(company1);
  const normCompany2 = normalizeName(company2);
  return calculateLevenshteinSimilarity(normCompany1, normCompany2);
};

const calculateTitleSimilarity = (title1?: string, title2?: string): number => {
  if (!title1 || !title2) return 0;
  const normTitle1 = normalizeName(title1);
  const normTitle2 = normalizeName(title2);
  return calculateLevenshteinSimilarity(normTitle1, normTitle2);
};

const calculatePhoneticSimilarity = (name1: string, name2: string): number => {
  const phonetic1 = getPhoneticRepresentation(name1);
  const phonetic2 = getPhoneticRepresentation(name2);
  return calculateLevenshteinSimilarity(phonetic1, phonetic2);
};

const calculateEmailDomainSimilarity = (email1?: string, email2?: string): number => {
  if (!email1 || !email2) return 0;
  const domain1 = email1.split('@')[1]?.toLowerCase();
  const domain2 = email2.split('@')[1]?.toLowerCase();
  if (!domain1 || !domain2) return 0;
  return domain1 === domain2 ? 1 : 0;
};

const calculateNameTokenSimilarity = (name1: string, name2: string): number => {
  const tokens1 = name1.toLowerCase().split(/\s+/);
  const tokens2 = name2.toLowerCase().split(/\s+/);
  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  return commonTokens.length / Math.max(tokens1.length, tokens2.length);
};

// Helper functions
const calculateLevenshteinSimilarity = (str1: string, str2: string): number => {
  const distance = calculateLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
};

const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = Array(str1.length + 1)
    .fill(null)
    .map(() => Array(str2.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[str1.length][str2.length];
};

const getPhoneticRepresentation = (name: string): string => {
  // Simple phonetic representation (can be enhanced with Soundex or Metaphone)
  return name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[aeiou]/g, '')
    .replace(/(.)\1+/g, '$1');
};

const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

// Weight configuration for different features
const featureWeights: Record<keyof ContactFeatures, number> = {
  emailSimilarity: 0.3,
  phoneSimilarity: 0.2,
  nameSimilarity: 0.2,
  companySimilarity: 0.1,
  titleSimilarity: 0.1,
  phoneticNameSimilarity: 0.05,
  emailDomainSimilarity: 0.05,
  nameTokenSimilarity: 0.05
};

// Main duplicate detection function
export const detectDuplicates = (
  contacts: Contact[],
  threshold = 0.8
): ContactPair[] => {
  const pairs: ContactPair[] = [];

  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const features = extractFeatures(contacts[i], contacts[j]);
      const similarityScore = calculateSimilarityScore(features);

      if (similarityScore >= threshold) {
        pairs.push({
          contact1: contacts[i],
          contact2: contacts[j],
          features,
          similarityScore
        });
      }
    }
  }

  return pairs;
};

// Calculate overall similarity score using weighted features
const calculateSimilarityScore = (features: ContactFeatures): number => {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [feature, weight] of Object.entries(featureWeights)) {
    const value = features[feature as keyof ContactFeatures];
    totalScore += value * weight;
    totalWeight += weight;
  }

  return totalScore / totalWeight;
};

// Group contacts by similarity
export const groupSimilarContacts = (
  contacts: Contact[],
  threshold = 0.8
): Contact[][] => {
  const pairs = detectDuplicates(contacts, threshold);
  const groups: Contact[][] = [];
  const processed = new Set<Contact>();

  for (const pair of pairs) {
    if (processed.has(pair.contact1) || processed.has(pair.contact2)) continue;

    const group = [pair.contact1, pair.contact2];
    processed.add(pair.contact1);
    processed.add(pair.contact2);

    // Find additional similar contacts
    for (const contact of contacts) {
      if (processed.has(contact)) continue;

      const features = extractFeatures(pair.contact1, contact);
      const similarityScore = calculateSimilarityScore(features);

      if (similarityScore >= threshold) {
        group.push(contact);
        processed.add(contact);
      }
    }

    groups.push(group);
  }

  // Add remaining contacts as single-item groups
  for (const contact of contacts) {
    if (!processed.has(contact)) {
      groups.push([contact]);
    }
  }

  return groups;
}; 