import { NormalizedContact } from '../utils/contactNormalization';
import { groupSimilarContacts } from '../utils/mlDuplicateDetection';

export interface BatchProcessingOptions {
  batchSize: number;
  similarityThreshold: number;
  onProgress?: (progress: number, stage: string) => void;
  onBatchProcessed?: (batch: NormalizedContact[], stage: string) => void;
  onNormalizationComplete?: (normalizedContacts: NormalizedContact[]) => void;
  onError?: (error: Error) => void;
}

export interface BatchProcessingResult {
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

  private constructor() {}

  public static getInstance(): BatchProcessingService {
    if (!BatchProcessingService.instance) {
      BatchProcessingService.instance = new BatchProcessingService();
    }
    return BatchProcessingService.instance;
  }

  public async processContacts(
    contacts: NormalizedContact[],
    options: BatchProcessingOptions
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 50;
    const similarityThreshold = options.similarityThreshold || 0.8;
    const batches = this.createBatches(contacts, batchSize);
    const totalBatches = batches.length;
    let processedBatches = 0;
    let failedBatches = 0;
    let duplicatesFound = 0;
    const duplicatesPerBatch: Record<number, number> = {};
    const processedContacts: NormalizedContact[] = [];
    const similarityGroups: NormalizedContact[][] = [];

    for (let i = 0; i < batches.length; i++) {
      if (this.isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!this.isPaused) {
              resolve(true);
            } else {
              setTimeout(checkPause, 100);
            }
          };
          checkPause();
        });
      }

      try {
        const batch = batches[i];
        
        if (options.onBatchProcessed) {
          options.onBatchProcessed(batch, 'normalizing');
        }

        const groups = groupSimilarContacts(batch, similarityThreshold);
        duplicatesFound += groups.length;
        duplicatesPerBatch[i] = groups.length;
        similarityGroups.push(...groups);

        processedContacts.push(...batch);
        processedBatches++;

        if (options.onProgress) {
          const progress = Math.round((processedBatches / totalBatches) * 100);
          options.onProgress(progress, 'processing');
        }

        if (options.onNormalizationComplete) {
          options.onNormalizationComplete(batch);
        }
      } catch (error) {
        failedBatches++;
        if (options.onError && error instanceof Error) {
          options.onError(error);
        }
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      contacts: processedContacts,
      similarityGroups,
      totalProcessed: processedContacts.length,
      processingTime,
      duplicatesFound,
      normalizationStats: {
        emailsNormalized: processedContacts.filter(c => c.email !== contacts.find(oc => oc.id === c.id)?.email).length,
        phonesNormalized: processedContacts.filter(c => c.phone !== contacts.find(oc => oc.id === c.id)?.phone).length,
        namesNormalized: processedContacts.filter(c => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() !== `${contacts.find(oc => oc.id === c.id)?.firstName ?? ''} ${contacts.find(oc => oc.id === c.id)?.lastName ?? ''}`.trim()).length
      },
      batchStats: {
        totalBatches,
        processedBatches,
        failedBatches,
        duplicatesPerBatch
      }
    };
  }

  private createBatches(contacts: NormalizedContact[], batchSize: number): NormalizedContact[][] {
    const batches: NormalizedContact[][] = [];
    for (let i = 0; i < contacts.length; i += batchSize) {
      batches.push(contacts.slice(i, i + batchSize));
    }
    return batches;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public isCurrentlyPaused(): boolean {
    return this.isPaused;
  }
} 