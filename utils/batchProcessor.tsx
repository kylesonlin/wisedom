import { Contact } from '../types/contact';
import { normalizeContacts } from './contactNormalization';
import { groupSimilarContacts } from './mlDuplicateDetection';
import { NormalizedContact } from './contactNormalization';

export type ProcessingStage = 'idle' | 'parsing' | 'validating' | 'normalizing' | 'saving' | 'complete';

interface BatchProcessorOptions {
  batchSize?: number;
  similarityThreshold?: number;
  onProgress?: (progress: number, stage: ProcessingStage) => void;
  onBatchProcessed?: (batch: NormalizedContact[], stage: ProcessingStage) => void;
  onNormalizationComplete?: (normalizedContacts: NormalizedContact[]) => void;
  onError?: (error: Error) => void;
}

interface BatchProcessorResult {
  contacts: NormalizedContact[];
  similarityGroups: NormalizedContact[][];
  totalProcessed: number;
  processingTime: number;
  duplicatesFound: number;
  normalizationStats: {
    emailsNormalized: number;
    phonesNormalized: number;
    namesNormalized: number;
  };
}

const getFullName = (contact: Contact | NormalizedContact) => {
  const firstName = contact.firstName ?? '';
  const lastName = contact.lastName ?? '';
  return `${firstName} ${lastName}`.trim();
};

export class BatchProcessor {
  private batchSize: number;
  private similarityThreshold: number;
  private onProgress?: (progress: number, stage: ProcessingStage) => void;
  private onBatchProcessed?: (batch: NormalizedContact[], stage: ProcessingStage) => void;
  private onNormalizationComplete?: (normalizedContacts: NormalizedContact[]) => void;
  private onError?: (error: Error) => void;

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize || 50;
    this.similarityThreshold = options.similarityThreshold || 0.8;
    this.onProgress = options.onProgress;
    this.onBatchProcessed = options.onBatchProcessed;
    this.onNormalizationComplete = options.onNormalizationComplete;
    this.onError = options.onError;
  }

  async processContacts(
    contacts: Contact[],
    options: BatchProcessorOptions = {}
  ): Promise<BatchProcessorResult> {
    const startTime = Date.now();
    const batchSize = options.batchSize || this.batchSize;
    const threshold = options.similarityThreshold || this.similarityThreshold;
    
    const totalContacts = contacts.length;
    const batches: NormalizedContact[][] = [];
    const processedContacts: NormalizedContact[] = [];
    const allSimilarityGroups: NormalizedContact[][] = [];
    const normalizationStats = {
      emailsNormalized: 0,
      phonesNormalized: 0,
      namesNormalized: 0
    };

    try {
      // Convert contacts to NormalizedContact[]
      const normalizedContacts = contacts.map(contact => ({
        ...contact,
        firstName: contact.firstName?.trim(),
        lastName: contact.lastName?.trim(),
        email: contact.email?.toLowerCase().trim(),
        phone: contact.phone?.trim(),
        normalizedEmail: contact.email?.toLowerCase().trim() ?? '',
        source: 'batchProcessor',
        confidence: 1,
        normalizationTimestamp: new Date(),
        originalValues: {
          email: contact.email,
          phone: contact.phone,
          firstName: contact.firstName,
          lastName: contact.lastName
        }
      }));

      // Split contacts into batches
      for (let i = 0; i < totalContacts; i += batchSize) {
        batches.push(normalizedContacts.slice(i, i + batchSize));
      }

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        // Update parsing progress
        const parsingProgress = Math.round(((i + 1) / batches.length) * 100);
        this.onProgress?.(parsingProgress, 'parsing');
        
        // Validate batch
        this.onProgress?.(0, 'validating');
        const validatedBatch = await this.validateBatch(batch);
        this.onBatchProcessed?.(validatedBatch, 'validating');
        
        // Normalize batch
        const normalizedBatch = normalizeContacts(validatedBatch);
        
        // Track normalization statistics
        normalizedBatch.forEach(contact => {
          if (contact.email?.includes('normalized')) normalizationStats.emailsNormalized++;
          if (contact.phone?.includes('normalized')) normalizationStats.phonesNormalized++;
          if (getFullName(contact).includes('normalized')) normalizationStats.namesNormalized++;
        });
        
        this.onNormalizationComplete?.(normalizedBatch);
        
        // Find similar contacts in the batch
        const batchGroups = groupSimilarContacts(normalizedBatch, threshold);
        
        // Merge similar contacts within the batch
        const mergedBatch = this.mergeBatchGroups(normalizedBatch, batchGroups);
        
        // Add to processed contacts
        processedContacts.push(...mergedBatch);
        
        // Update progress
        const progress = Math.round(((i + 1) / batches.length) * 100);
        this.onProgress?.(progress, 'saving');
        this.onBatchProcessed?.(mergedBatch, 'saving');
      }

      // Final pass to find similar contacts across all batches
      const finalGroups = groupSimilarContacts(processedContacts, threshold);
      allSimilarityGroups.push(...finalGroups);

      const processingTime = Date.now() - startTime;

      return {
        contacts: processedContacts,
        similarityGroups: allSimilarityGroups,
        totalProcessed: totalContacts,
        processingTime,
        duplicatesFound: allSimilarityGroups.filter(group => group.length > 1).length,
        normalizationStats
      };
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async validateBatch(batch: NormalizedContact[]): Promise<NormalizedContact[]> {
    return batch.map(contact => ({
      ...contact,
      firstName: contact.firstName?.trim(),
      lastName: contact.lastName?.trim(),
      email: contact.email?.toLowerCase().trim(),
      phone: contact.phone?.trim(),
      normalizedEmail: contact.email?.toLowerCase().trim() ?? '',
      source: 'batchProcessor',
      confidence: 1,
      normalizationTimestamp: new Date(),
      originalValues: {
        email: contact.email,
        phone: contact.phone,
        firstName: contact.firstName,
        lastName: contact.lastName
      }
    }));
  }

  private mergeBatchGroups(contacts: NormalizedContact[], groups: NormalizedContact[][]): NormalizedContact[] {
    const mergedContacts: NormalizedContact[] = [];
    const processed = new Set<NormalizedContact>();

    for (const group of groups) {
      if (group.length <= 1) {
        mergedContacts.push(...group);
        continue;
      }

      // Merge similar contacts in the group
      const mergedContact = this.mergeContacts(group);
      mergedContacts.push(mergedContact);
      group.forEach(contact => processed.add(contact));
    }

    // Add remaining unprocessed contacts
    for (const contact of contacts) {
      if (!processed.has(contact)) {
        mergedContacts.push(contact);
      }
    }

    return mergedContacts;
  }

  private mergeContacts(contacts: NormalizedContact[]): NormalizedContact {
    if (contacts.length === 0) {
      throw new Error('No contacts to merge');
    }

    const merged: NormalizedContact = { ...contacts[0] };

    for (let i = 1; i < contacts.length; i++) {
      const current = contacts[i];
      
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
      if (getFullName(current) !== getFullName(merged)) {
        merged.firstName = merged.firstName
          ? `${merged.firstName} (${current.firstName})`
          : current.firstName;
        merged.lastName = merged.lastName
          ? `${merged.lastName} (${current.lastName})`
          : current.lastName;
      }

      // Merge additional fields
      if (current.company && current.company !== merged.company) {
        merged.company = merged.company
          ? `${merged.company}, ${current.company}`
          : current.company;
      }

      if (current.title && current.title !== merged.title) {
        merged.title = merged.title
          ? `${merged.title}, ${current.title}`
          : current.title;
      }

      // Merge additional fields
      if (current.additionalFields) {
        if (!merged.additionalFields) {
          merged.additionalFields = {};
        }
        Object.entries(current.additionalFields).forEach(([key, value]) => {
          if (value && !merged.additionalFields?.[key]) {
            merged.additionalFields![key] = value;
          }
        });
      }
    }

    return merged;
  }
}

export default BatchProcessor; 