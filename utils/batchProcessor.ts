import { Contact } from '../types/contact';
import { normalizeContacts } from './contactNormalization';
import { groupSimilarContacts } from './mlDuplicateDetection';

interface BatchProcessorOptions {
  batchSize?: number;
  similarityThreshold?: number;
  onProgress?: (progress: number, stage: ProcessingStage) => void;
  onBatchProcessed?: (batch: Contact[], stage: ProcessingStage) => void;
  onNormalizationComplete?: (normalizedContacts: Contact[]) => void;
}

interface BatchProcessorResult {
  contacts: Contact[];
  similarityGroups: Contact[][];
  totalProcessed: number;
  processingTime: number;
  duplicatesFound: number;
  normalizationStats: {
    emailsNormalized: number;
    phonesNormalized: number;
    namesNormalized: number;
  };
}

type ProcessingStage = 'parsing' | 'normalizing' | 'deduplicating' | 'saving';

const getFullName = (contact: any) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

export class BatchProcessor {
  private batchSize: number;
  private similarityThreshold: number;
  private onProgress?: (progress: number, stage: ProcessingStage) => void;
  private onBatchProcessed?: (batch: Contact[], stage: ProcessingStage) => void;
  private onNormalizationComplete?: (normalizedContacts: Contact[]) => void;

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize || 1000;
    this.similarityThreshold = options.similarityThreshold || 0.8;
    this.onProgress = options.onProgress;
    this.onBatchProcessed = options.onBatchProcessed;
    this.onNormalizationComplete = options.onNormalizationComplete;
  }

  async processContacts(
    contacts: Contact[],
    options: BatchProcessorOptions = {}
  ): Promise<BatchProcessorResult> {
    const startTime = Date.now();
    const batchSize = options.batchSize || this.batchSize;
    const threshold = options.similarityThreshold || this.similarityThreshold;
    
    const totalContacts = contacts.length;
    const batches: Contact[][] = [];
    const processedContacts: Contact[] = [];
    const allSimilarityGroups: Contact[][] = [];
    const normalizationStats = {
      emailsNormalized: 0,
      phonesNormalized: 0,
      namesNormalized: 0
    };

    // Split contacts into batches
    for (let i = 0; i < totalContacts; i += batchSize) {
      batches.push(contacts.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Update parsing progress
      const parsingProgress = Math.round(((i + 1) / batches.length) * 100);
      this.onProgress?.(parsingProgress, 'parsing');
      
      // Normalize batch
      this.onProgress?.(0, 'normalizing');
      const normalizedBatch = normalizeContacts(batch);
      
      // Track normalization statistics
      normalizedBatch.forEach(contact => {
        if (contact.email?.includes('normalized')) normalizationStats.emailsNormalized++;
        if (contact.phone?.includes('normalized')) normalizationStats.phonesNormalized++;
        if (getFullName(contact).includes('normalized')) normalizationStats.namesNormalized++;
      });
      
      this.onNormalizationComplete?.(normalizedBatch);
      this.onBatchProcessed?.(normalizedBatch, 'normalizing');
      
      // Find similar contacts in the batch
      this.onProgress?.(0, 'deduplicating');
      const batchGroups = groupSimilarContacts(normalizedBatch, threshold);
      
      // Merge similar contacts within the batch
      const mergedBatch = this.mergeBatchGroups(normalizedBatch, batchGroups);
      
      // Add to processed contacts
      processedContacts.push(...mergedBatch);
      
      // Update progress
      const progress = Math.round(((i + 1) / batches.length) * 100);
      this.onProgress?.(progress, 'deduplicating');
      this.onBatchProcessed?.(mergedBatch, 'deduplicating');
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
  }

  private mergeBatchGroups(contacts: Contact[], groups: Contact[][]): Contact[] {
    const mergedContacts: Contact[] = [];
    const processed = new Set<Contact>();

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

  private mergeContacts(contacts: Contact[]): Contact {
    if (contacts.length === 0) {
      throw new Error('No contacts to merge');
    }

    const merged: Contact = { ...contacts[0] };

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
        merged.name = merged.name
          ? `${merged.name} (${getFullName(current)})`
          : getFullName(current);
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