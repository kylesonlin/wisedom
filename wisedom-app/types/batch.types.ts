import { NormalizedContact, ContactImportResult, ContactImportOptions } from './contact';

export interface BatchProcessingConfig {
  maxBatchSize: number;
  similarityThreshold: number;
  onProgress?: (progress: number) => void;
  onBatchProcessed?: (batch: NormalizedContact[]) => void;
  onNormalizationComplete?: (stats: ContactImportResult) => void;
  onError?: (error: Error) => void;
}

export interface BatchProcessingStats {
  totalBatches: number;
  averageBatchSize: number;
  totalProcessed: number;
  totalErrors: number;
  processingTime: number;
  retries: number;
}

export interface BatchProcessingState {
  isPaused: boolean;
  isProcessing: boolean;
  currentBatch: number;
  totalBatches: number;
  progress: number;
  errors: Error[];
}

export interface BatchProcessor<T> {
  processBatch(batch: T[], options: ContactImportOptions): Promise<ContactImportResult>;
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  getState(): BatchProcessingState;
}

export type BatchProcessingStatus = 'idle' | 'processing' | 'paused' | 'completed' | 'error';
export type BatchProcessingError = {
  code: string;
  message: string;
  batchIndex: number;
  timestamp: Date;
}; 