import { BatchProcessingService, BatchProcessingOptions } from '@/services/batchProcessingService';
import { mockContacts, mockInvalidContacts, mockDuplicateContacts } from './__fixtures__/contacts';
import { mockBatchProcessor } from '@/services/__mocks__/batchProcessingService';
import { NormalizedContact } from '@/types/contact';
import '@testing-library/jest-dom';

// Mock the BatchProcessingService
jest.mock('@/services/batchProcessingService');

describe('BatchProcessingService', () => {
  let service: BatchProcessingService;
  let onProgress: jest.Mock;
  let onBatchProcessed: jest.Mock;
  let onNormalizationComplete: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    onProgress = jest.fn();
    onBatchProcessed = jest.fn();
    onNormalizationComplete = jest.fn();
    onError = jest.fn();
    service = BatchProcessingService.getInstance();
    (service as any).batchProcessor = mockBatchProcessor;
  });

  describe('processContacts', () => {
    it('should process contacts in batches', async () => {
      const options: BatchProcessingOptions = {
        batchSize: 2,
        similarityThreshold: 0.8,
        onProgress,
        onBatchProcessed,
        onNormalizationComplete,
        onError
      };

      await service.processContacts(mockContacts, options);

      expect(onProgress).toHaveBeenCalled();
      expect(onBatchProcessed).toHaveBeenCalled();
      expect(onNormalizationComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle pause and resume', async () => {
      const options: BatchProcessingOptions = {
        batchSize: 2,
        similarityThreshold: 0.8,
        onProgress,
        onBatchProcessed,
        onNormalizationComplete,
        onError
      };

      const processPromise = service.processContacts(mockContacts, options);
      service.pause();
      expect(service.isCurrentlyPaused()).toBe(true);
      service.resume();
      await processPromise;

      expect(onBatchProcessed).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const options: BatchProcessingOptions = {
        batchSize: 2,
        similarityThreshold: 0.8,
        onProgress,
        onBatchProcessed,
        onNormalizationComplete,
        onError
      };

      await service.processContacts(mockInvalidContacts as NormalizedContact[], options);

      expect(onError).toHaveBeenCalled();
    });

    it('should detect and handle duplicates', async () => {
      const options: BatchProcessingOptions = {
        batchSize: 2,
        similarityThreshold: 0.8,
        onProgress,
        onBatchProcessed,
        onNormalizationComplete,
        onError
      };

      await service.processContacts([...mockContacts, ...mockDuplicateContacts], options);

      expect(onBatchProcessed).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });
}); 