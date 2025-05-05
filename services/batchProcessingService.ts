import { Contact } from '../types/contact';
import { NormalizationService } from './normalizationService';
import { groupSimilarContacts } from '../utils/mlDuplicateDetection';

interface BatchProcessingOptions {
  batchSize: number;
  maxParallelBatches: number;
  similarityThreshold: number;
  onProgress?: (progress: number, stage: string) => void;
  onBatchProcessed?: (batch: Contact[], stage: string) => void;
  onNormalizationComplete?: (normalizedContacts: Contact[]) => void;
}

interface BatchProcessingResult {
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
  batchStats: {
    totalBatches: number;
    processedBatches: number;
    failedBatches: number;
    duplicatesPerBatch: Record<number, number>;
  };
}

export class BatchProcessingService {
  private static instance: BatchProcessingService;
  private isPaused: boolean = false;
  private isProcessing: boolean = false;
  private currentBatchIndex: number = 0;
  private processedBatches: Contact[][] = [];
  private normalizationService: NormalizationService;

  private constructor() {
    this.normalizationService = NormalizationService.getInstance();
  }

  static getInstance(): BatchProcessingService {
    if (!BatchProcessingService.instance) {
      BatchProcessingService.instance = new BatchProcessingService();
    }
    return BatchProcessingService.instance;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  private async waitIfPaused(): Promise<void> {
    while (this.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async processBatch(
    batch: Contact[],
    options: BatchProcessingOptions
  ): Promise<Contact[]> {
    await this.waitIfPaused();

    // Normalize contacts
    const { normalized, stats } = this.normalizationService.normalizeContacts(batch);
    options.onNormalizationComplete?.(normalized);

    // Find duplicates
    const groups = groupSimilarContacts(normalized, options.similarityThreshold);
    const duplicates = groups.filter(group => group.length > 1).length;

    options.onBatchProcessed?.(normalized, 'normalizing');

    return normalized;
  }

  async processContacts(
    contacts: Contact[],
    options: BatchProcessingOptions
  ): Promise<BatchProcessingResult> {
    this.isProcessing = true;
    this.currentBatchIndex = 0;
    this.processedBatches = [];
    const startTime = Date.now();

    const batches: Contact[][] = [];
    for (let i = 0; i < contacts.length; i += options.batchSize) {
      batches.push(contacts.slice(i, i + options.batchSize));
    }

    const batchStats = {
      totalBatches: batches.length,
      processedBatches: 0,
      failedBatches: 0,
      duplicatesPerBatch: {} as Record<number, number>
    };

    // Process batches in parallel
    const processPromises: Promise<void>[] = [];
    const activeBatches = new Set<number>();

    for (let i = 0; i < batches.length; i++) {
      await this.waitIfPaused();

      // Wait if we've reached the maximum parallel batches
      while (activeBatches.size >= options.maxParallelBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const batchIndex = i;
      activeBatches.add(batchIndex);

      const promise = this.processBatch(batches[i], options)
        .then(processedBatch => {
          this.processedBatches[batchIndex] = processedBatch;
          batchStats.processedBatches++;
          options.onProgress?.(
            (batchStats.processedBatches / batchStats.totalBatches) * 100,
            'processing'
          );
        })
        .catch(error => {
          console.error(`Error processing batch ${batchIndex}:`, error);
          batchStats.failedBatches++;
        })
        .finally(() => {
          activeBatches.delete(batchIndex);
        });

      processPromises.push(promise);
    }

    await Promise.all(processPromises);

    // Combine all processed batches
    const allProcessedContacts = this.processedBatches.flat();

    // Final duplicate detection
    const finalGroups = groupSimilarContacts(allProcessedContacts, options.similarityThreshold);
    const duplicatesFound = finalGroups.filter(group => group.length > 1).length;

    const normalizationStats = this.normalizationService.getNormalizationStats();

    this.isProcessing = false;

    return {
      contacts: allProcessedContacts,
      similarityGroups: finalGroups,
      totalProcessed: contacts.length,
      processingTime: Date.now() - startTime,
      duplicatesFound,
      normalizationStats: {
        emailsNormalized: normalizationStats.changesByType.email,
        phonesNormalized: normalizationStats.changesByType.phone,
        namesNormalized: normalizationStats.changesByType.name
      },
      batchStats
    };
  }

  saveIntermediateResults(): {
    processedBatches: Contact[][];
    currentBatchIndex: number;
  } {
    return {
      processedBatches: this.processedBatches,
      currentBatchIndex: this.currentBatchIndex
    };
  }

  loadIntermediateResults(results: {
    processedBatches: Contact[][];
    currentBatchIndex: number;
  }): void {
    this.processedBatches = results.processedBatches;
    this.currentBatchIndex = results.currentBatchIndex;
  }
} 