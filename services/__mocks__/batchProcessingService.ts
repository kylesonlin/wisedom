import { BatchProcessor, BatchProcessingState } from '@/types/batch.types';
import { NormalizedContact, ContactImportResult, ContactImportOptions } from '@/types/contact';

export class MockBatchProcessor implements BatchProcessor {
  private state: BatchProcessingState = {
    isPaused: false,
    isProcessing: false,
    currentBatch: 0,
    totalBatches: 0,
    progress: 0,
    errors: []
  };

  async processBatch(
    batch: NormalizedContact[],
    options: ContactImportOptions
  ): Promise<ContactImportResult> {
    this.state.isProcessing = true;
    this.state.currentBatch = 1;
    this.state.totalBatches = Math.ceil(batch.length / options.batchSize);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const result: ContactImportResult = {
        contacts: batch,
        totalProcessed: batch.length,
        duplicatesFound: 0,
        processingTime: 100,
        normalizationStats: {
          emailsNormalized: batch.length,
          phonesNormalized: batch.length,
          namesNormalized: batch.length
        },
        batchStats: {
          totalBatches: 1,
          averageBatchSize: batch.length
        }
      };

      if (options.onProgress) {
        options.onProgress(100);
      }

      if (options.onBatchProcessed) {
        options.onBatchProcessed(batch);
      }

      if (options.onNormalizationComplete) {
        options.onNormalizationComplete(result);
      }

      return result;
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    } finally {
      this.state.isProcessing = false;
    }
  }

  pause(): void {
    this.state.isPaused = true;
  }

  resume(): void {
    this.state.isPaused = false;
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }

  getState(): BatchProcessingState {
    return { ...this.state };
  }
}

export const mockBatchProcessor = new MockBatchProcessor(); 