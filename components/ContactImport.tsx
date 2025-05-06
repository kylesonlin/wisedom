"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { Contact, FilterGroupOperation, BatchOperation, ImportOperation } from '../types/contact';
import { parseFileContent, detectFileFormat } from '../utils/fileFormatHandlers';
import { BatchProcessingService } from '../services/batchProcessingService';
import { NormalizationService } from '../services/normalizationService';
import {
  ImportError,
  ImportErrorType,
  createError,
  formatErrorForDisplay,
  isRecoverableError,
  getErrorResolutionSteps,
} from '../utils/errorHandling';
import { ErrorReportingService } from '../services/errorReporting';
import { ErrorRecoveryService } from '../services/errorRecovery';
import {
  safeEvaluateFunction,
  safeParseDate,
  validateEnvVars,
  safeSupabaseOperation,
  processBatchWithRetry,
  cleanupResources,
  isPotentialDuplicate
} from '../utils/safetyUtils';
import { BatchProcessor, ProcessingStage } from '../utils/batchProcessor';
import { useDropzone } from 'react-dropzone';
import { useContactStore } from '../store/contactStore';
import { useToast } from '../hooks/useToast';
import { normalizeContacts } from '../utils/contactNormalization';
import { groupSimilarContacts } from '../utils/mlDuplicateDetection';
import { SaveError } from '../utils/errorHandling';

// Validate environment variables on component mount
validateEnvVars();

const supabase = getSupabaseClient();

// Add new types for enhanced functionality
type ConflictResolutionStrategy = 'merge' | 'skip' | 'keep_both' | 'custom';
type MergeStrategy = 'prefer_new' | 'prefer_existing' | 'combine' | 'custom';
type ImportAnalytics = {
  totalContacts: number;
  processedContacts: number;
  duplicatesFound: number;
  conflictsDetected: number;
  mergedContacts: number;
  skippedContacts: number;
  errorCount: number;
  warningCount: number;
  processingTime: number;
};

interface BatchProcessingResult {
  similarityGroups: Contact[][];
  batchStats: {
    totalBatches: number;
    processedBatches: number;
    failedBatches: number;
    duplicatesPerBatch: Record<number, number>;
  };
}

type CustomFilter = {
  field: keyof Contact;
  operator:
    | 'contains'
    | 'equals'
    | 'startsWith'
    | 'endsWith'
    | 'regex'
    | 'custom'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'dateBefore'
    | 'dateAfter'
    | 'dateBetween'
    | 'matchesPattern'
    | 'customValidation';
  value: string;
  value2?: string;
  customFunction?: string;
  isRegex?: boolean;
  caseSensitive?: boolean;
  validationPattern?: string;
  validationMessage?: string;
  id?: string; // for filter group removal
};

type FilterGroup = {
  id: string;
  filters: CustomFilter[];
  combination: 'AND' | 'OR';
  parentGroupId?: string;
  level: number;
};

type FilterOptions = {
  searchTerm: string;
  field: 'all' | keyof Contact;
  hasChanges: 'all' | 'changed' | 'unchanged';
  normalizationType: 'all' | 'email' | 'phone' | 'firstName' | 'lastName' | 'company' | 'title';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  customFilters: CustomFilter[];
  filterCombination: 'AND' | 'OR';
  filterGroups: FilterGroup[];
};

// Add at the top of the component, after imports:
const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  normalized: number;
}

interface ImportState {
  isImporting: boolean;
  stage: ProcessingStage;
  progress: number;
  stats: ImportStats;
  errors: ImportError[];
  duplicates: Contact[][];
  normalizedContacts: Contact[];
}

const initialState: ImportState = {
  isImporting: false,
  stage: 'idle',
  progress: 0,
  stats: {
    total: 0,
    valid: 0,
    invalid: 0,
    duplicates: 0,
    normalized: 0
  },
  errors: [],
  duplicates: [],
  normalizedContacts: []
};

const ContactImport: React.FC = () => {
  const [state, setState] = useState<ImportState>(initialState);
  const { addContacts } = useContactStore();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ImportError | null>(null);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('idle');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [importAnalytics, setImportAnalytics] = useState<ImportAnalytics>({
    totalContacts: 0,
    processedContacts: 0,
    duplicatesFound: 0,
    conflictsDetected: 0,
    mergedContacts: 0,
    skippedContacts: 0,
    errorCount: 0,
    warningCount: 0,
    processingTime: 0
  });
  const [similarityGroups, setSimilarityGroups] = useState<Contact[][]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'csv' | 'json' | 'vcard'>('auto');
  const [showHelp, setShowHelp] = useState(false);
  const [activeStep, setActiveStep] = useState<'upload' | 'review' | 'save'>('upload');
  const [normalizationStats, setNormalizationStats] = useState<{
    emailsNormalized: number;
    phonesNormalized: number;
    namesNormalized: number;
  }>({ emailsNormalized: 0, phonesNormalized: 0, namesNormalized: 0 });
  const [batchStats, setBatchStats] = useState<{
    totalBatches: number;
    processedBatches: number;
    failedBatches: number;
    duplicatesPerBatch: Record<number, number>;
  }>({ totalBatches: 0, processedBatches: 0, failedBatches: 0, duplicatesPerBatch: {} });
  const [previewContacts, setPreviewContacts] = useState<Contact[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    field: 'all',
    hasChanges: 'all',
    normalizationType: 'all',
    dateRange: { start: null, end: null },
    customFilters: [],
    filterCombination: 'AND',
    filterGroups: []
  });
  const [sortOptions, setSortOptions] = useState({
    field: 'firstName' as keyof Contact,
    direction: 'asc' as 'asc' | 'desc'
  });
  const [filterPresets, setFilterPresets] = useState<Array<{
    name: string;
    filters: typeof filterOptions;
    sort: typeof sortOptions;
  }>>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showFilterPresetModal, setShowFilterPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [customRules, setCustomRules] = useState<Array<{
    field: keyof Contact;
    pattern: string;
    replacement: string;
    description: string;
  }>>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<keyof Contact>('firstName');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [bulkEditOperation, setBulkEditOperation] = useState<'set' | 'append' | 'prepend' | 'replace' | 'regexReplace' | 'findAndReplace' | 'template' | 'fieldMapping'>('set');
  const [bulkEditFindValue, setBulkEditFindValue] = useState('');
  const [bulkEditReplaceValue, setBulkEditReplaceValue] = useState('');
  const [bulkEditRegexFlags, setBulkEditRegexFlags] = useState('g');
  const [bulkEditTemplate, setBulkEditTemplate] = useState('');
  const [bulkEditFieldMappings, setBulkEditFieldMappings] = useState<Array<{
    sourceField: keyof Contact;
    targetField: keyof Contact;
    transform?: string;
  }>>([]);
  const [operationHistory, setOperationHistory] = useState<Array<{
    type: 'edit' | 'delete' | 'group';
    contacts: Contact[];
    timestamp: number;
    description: string;
    preview?: Contact[];
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedFilterGroup, setDraggedFilterGroup] = useState<string | null>(null);
  const [selectedFilterGroups, setSelectedFilterGroups] = useState<Set<string>>(new Set());
  const [showHistoryPreview, setShowHistoryPreview] = useState(false);
  const [previewOperation, setPreviewOperation] = useState<typeof operationHistory[0] | null>(null);

  // Add new state variables
  const [conflictResolutionStrategy, setConflictResolutionStrategy] = useState<ConflictResolutionStrategy>('merge');
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('prefer_new');
  const [customMergeRules, setCustomMergeRules] = useState<Array<{
    field: keyof Contact;
    strategy: 'prefer_new' | 'prefer_existing' | 'combine' | 'custom';
    customFunction?: string;
  }>>([]);

  const batchProcessor = BatchProcessingService.getInstance();
  const normalizationService = NormalizationService.getInstance();

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (!fileType || !['csv', 'json'].includes(fileType)) {
      showToast('Please upload a CSV or JSON file', 'error');
      return;
    }

    setState(prev => ({
      ...prev,
      isImporting: true,
      stage: 'parsing',
      progress: 0,
      errors: []
    }));

    try {
      const text = await file.text();
      let contacts: Contact[] = [];

      if (fileType === 'csv') {
        contacts = parseCSV(text);
      } else {
        contacts = parseJSON(text);
      }

      setState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          total: contacts.length
        }
      }));

      const batchProcessor = new BatchProcessor({
        batchSize: 50,
        similarityThreshold: 0.8,
        onProgress: (progress, stage) => {
          setState(prev => ({
            ...prev,
            progress,
            stage
          }));
        },
        onBatchProcessed: (batch, stage) => {
          setState(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              valid: prev.stats.valid + batch.length
            }
          }));
        },
        onNormalizationComplete: (normalizedContacts) => {
          setState(prev => ({
            ...prev,
            stage: 'normalizing',
            normalizedContacts: [...prev.normalizedContacts, ...normalizedContacts],
            stats: {
              ...prev.stats,
              normalized: prev.stats.normalized + normalizedContacts.length
            }
          }));
        },
        onError: (error) => {
          const importError = new ImportError(
            'PROCESSING_ERROR',
            error.message,
            { stack: error.stack }
          );
          setState(prev => ({
            ...prev,
            errors: [...prev.errors, importError]
          }));
        }
      });

      const result = await batchProcessor.processContacts(contacts);

      setState(prev => ({
        ...prev,
        stage: 'complete',
        progress: 100,
        stats: {
          ...prev.stats,
          duplicates: result.duplicatesFound
        },
        duplicates: result.similarityGroups
      }));

      showToast(`Successfully imported ${result.contacts.length} contacts`, 'success');
    } catch (error) {
      const importError = error instanceof ImportError
        ? error
        : new ImportError('PROCESSING_ERROR', 'Failed to process file', {
            originalError: error instanceof Error ? error.message : String(error)
          });

      setState(prev => ({
        ...prev,
        isImporting: false,
        stage: 'idle',
        errors: [...prev.errors, importError]
      }));

      showToast(importError.message, 'error');
    }
  }, [showToast]);

  const handleSaveContacts = useCallback(async () => {
    if (state.normalizedContacts.length === 0) {
      showToast('No contacts to save', 'error');
      return;
    }

    setState(prev => ({
      ...prev,
      stage: 'saving',
      progress: 0
    }));

    try {
      await addContacts(state.normalizedContacts);
      
      setState(prev => ({
        ...prev,
        stage: 'complete',
        progress: 100
      }));

      showToast('Contacts saved successfully', 'success');
      resetState();
    } catch (error) {
      const importError = error instanceof ImportError
        ? error
        : new SaveError('Failed to save contacts', {
            originalError: error instanceof Error ? error.message : String(error)
          });

      setState(prev => ({
        ...prev,
        stage: 'idle',
        errors: [...prev.errors, importError]
      }));

      showToast(importError.message, 'error');
    }
  }, [state.normalizedContacts, addContacts, showToast, resetState]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleProcessContacts = async () => {
    setIsProcessing(true);
    setCurrentStage('normalizing');
    setError(null);

    try {
      // Apply custom rules
      customRules.forEach(rule => {
        normalizationService.addCustomRule({
          field: rule.field,
          pattern: new RegExp(rule.pattern),
          replacement: rule.replacement,
          description: rule.description
        });
      });

      const result = await processBatchWithRetry<Contact, BatchProcessingResult>(
        contacts,
        async (batch) => {
          const processed = await batchProcessor.processContacts(batch, {
            batchSize: 1000,
            maxParallelBatches: 4,
            similarityThreshold: 0.8,
            onProgress: (progress, stage) => {
              setProgress(progress);
              setCurrentStage(stage as ProcessingStage);
            },
            onBatchProcessed: (batch, stage) => {
              setPreviewContacts(prev => [...prev, ...batch]);
            },
            onNormalizationComplete: (normalizedContacts) => {
              setNormalizationStats(prev => ({
                ...prev,
                emailsNormalized: normalizedContacts.filter(c => c.email !== contacts.find(oc => oc.id === c.id)?.email).length,
                phonesNormalized: normalizedContacts.filter(c => c.phone !== contacts.find(oc => oc.id === c.id)?.phone).length,
                namesNormalized: normalizedContacts.filter(c => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() !== `${contacts.find(oc => oc.id === c.id)?.firstName ?? ''} ${contacts.find(oc => oc.id === c.id)?.lastName ?? ''}`.trim()).length
              }));
            }
          });
          return processed;
        }
      );

      setSimilarityGroups(result.similarityGroups);
      setBatchStats(result.batchStats);
      setActiveStep('save');
    } catch (err) {
      setError(createError('PROCESSING_ERROR', 'Failed to process contacts', err instanceof Error ? err : undefined));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseResume = () => {
    if (batchProcessor.isCurrentlyPaused()) {
      batchProcessor.resume();
    } else {
      batchProcessor.pause();
    }
  };

  const handleAddCustomRule = () => {
    setCustomRules(prev => [...prev, {
      field: 'email',
      pattern: '',
      replacement: '',
      description: ''
    }]);
  };

  const handleRemoveCustomRule = (index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index));
    normalizationService.removeCustomRule(index);
  };

  const handleRevertChanges = (contact: Contact) => {
    const reverted = normalizationService.revertChanges(contact);
    setContacts(prev => prev.map(c => c.id === contact.id ? reverted : c));
  };

  const handleFilterChange = (field: keyof typeof filterOptions, value: any) => {
    setFilterOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (field: keyof typeof sortOptions, value: any) => {
    setSortOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const handleCustomFilterAdd = () => {
    setFilterOptions(prev => ({
      ...prev,
      customFilters: [...prev.customFilters, {
        field: 'firstName',
        operator: 'contains',
        value: '',
        isRegex: false,
        caseSensitive: false
      }]
    }));
  };

  const handleFilterGroupAdd = () => {
    setFilterOptions(prev => ({
      ...prev,
      filterGroups: [...prev.filterGroups, {
        id: Math.random().toString(36).substr(2, 9),
        filters: [],
        combination: 'AND',
        level: 0
      }]
    }));
  };

  const handleFilterGroupRemove = (groupId: string) => {
    setFilterOptions(prev => ({
      ...prev,
      filterGroups: prev.filterGroups.filter(group => group.id !== groupId)
    }));
  };

  const handleFilterGroupChange = (groupId: string, field: 'filters' | 'combination', value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      filterGroups: prev.filterGroups.map(group => 
        group.id === groupId ? { ...group, [field]: value } : group
      )
    }));
  };

  const handleBulkEdit = () => {
    const contactsToEdit = previewContacts.filter(c => selectedContacts.has(c.id));
    const originalContacts = [...contactsToEdit];
    
    contactsToEdit.forEach(contact => {
      if (bulkEditOperation === 'template') {
        let newValue = bulkEditTemplate;
        Object.keys(contact).forEach(field => {
          const value = contact[field as keyof Contact]?.toString() || '';
          newValue = newValue.replace(new RegExp(`\\{${field}\\}`, 'g'), value);
        });
        (contact as any)[bulkEditField] = newValue;
      } else if (bulkEditOperation === 'fieldMapping') {
        bulkEditFieldMappings.forEach(mapping => {
          const sourceValue = contact[mapping.sourceField]?.toString() || '';
          let targetValue = sourceValue;
          
          if (mapping.transform) {
            try {
              const transformFunc = new Function('value', mapping.transform);
              targetValue = transformFunc(sourceValue);
            } catch (e) {
              console.error('Invalid transform function:', e);
            }
          }
          
          (contact as any)[mapping.targetField] = targetValue;
        });
      } else {
        const currentValue = contact[bulkEditField]?.toString() || '';
        let newValue = bulkEditValue;

        switch (bulkEditOperation) {
          case 'append':
            newValue = currentValue + bulkEditValue;
            break;
          case 'prepend':
            newValue = bulkEditValue + currentValue;
            break;
          case 'replace':
            newValue = currentValue.replace(new RegExp(bulkEditFindValue, 'g'), bulkEditReplaceValue);
            break;
          case 'regexReplace':
            try {
              const regex = new RegExp(bulkEditFindValue, bulkEditRegexFlags);
              newValue = currentValue.replace(regex, bulkEditReplaceValue);
            } catch (e) {
              console.error('Invalid regex:', e);
              return;
            }
            break;
          case 'findAndReplace':
            newValue = currentValue.replace(bulkEditFindValue, bulkEditReplaceValue);
            break;
        }

        (contact as any)[bulkEditField] = newValue;
      }
    });

    // Add to history
    setOperationHistory(prev => [
      ...prev.slice(0, historyIndex + 1),
      {
        type: 'edit',
        contacts: originalContacts,
        timestamp: Date.now(),
        description: `Bulk edit: ${bulkEditOperation} on ${selectedContacts.size} contacts`,
        preview: contactsToEdit
      }
    ]);
    setHistoryIndex(prev => prev + 1);

    setShowBulkEditModal(false);
    setBulkEditValue('');
    setBulkEditFindValue('');
    setBulkEditReplaceValue('');
    setBulkEditTemplate('');
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedContacts.size} contacts?`)) {
      const contactsToDelete = previewContacts.filter(c => selectedContacts.has(c.id));
      
      // Add to history
      setOperationHistory(prev => [
        ...prev.slice(0, historyIndex + 1),
        {
          type: 'delete',
          contacts: contactsToDelete,
          timestamp: Date.now(),
          description: 'Bulk delete'
        }
      ]);
      setHistoryIndex(prev => prev + 1);

      setPreviewContacts(prev => prev.filter(c => !selectedContacts.has(c.id)));
      setSelectedContacts(new Set());
    }
  };

  const handleSelectAll = () => {
    const filteredContacts = getFilteredAndSortedContacts();
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkRevert = () => {
    const contactsToRevert = previewContacts.filter(c => selectedContacts.has(c.id));
    contactsToRevert.forEach(contact => handleRevertChanges(contact));
    setSelectedContacts(new Set());
  };

  const handleExportSelected = () => {
    const contactsToExport = previewContacts.filter(c => selectedContacts.has(c.id));
    // Comment out convertContactsToCSV/downloadCSV if not defined
    // const csv = convertContactsToCSV(contactsToExport);
    // downloadCSV(csv, 'exported_contacts.csv');
  };

  const handleSavePreset = () => {
    if (!newPresetName) return;
    
    setFilterPresets(prev => [...prev, {
      name: newPresetName,
      filters: { ...filterOptions },
      sort: { ...sortOptions }
    }]);
    
    setNewPresetName('');
    setShowFilterPresetModal(false);
  };

  const handleLoadPreset = (preset: typeof filterPresets[0]) => {
    setFilterOptions(preset.filters);
    setSortOptions(preset.sort);
  };

  const handleDeletePreset = (index: number) => {
    setFilterPresets(prev => prev.filter((_, i) => i !== index));
  };

  const getFilteredAndSortedContacts = () => {
    let filtered = [...previewContacts];

    // Apply search filter
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        Object.values(contact).some(value => 
          value?.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply field filter
    if (filterOptions.field !== 'all') {
      const field = filterOptions.field as keyof Contact;
      filtered = filtered.filter(contact => {
        return contact[field] !== undefined && contact[field] !== null;
      });
    }

    // Apply changes filter
    if (filterOptions.hasChanges !== 'all') {
      filtered = filtered.filter(contact => {
        const original = contacts.find(c => c.id === contact.id);
        if (!original) return false;
        
        const hasChanges = Object.keys(contact).some(key => 
          contact[key as keyof Contact] !== original[key as keyof Contact]
        );
        
        return filterOptions.hasChanges === 'changed' ? hasChanges : !hasChanges;
      });
    }

    // Apply normalization type filter
    if (filterOptions.normalizationType !== 'all') {
      const field = filterOptions.normalizationType as keyof Contact;
      filtered = filtered.filter(contact => {
        const original = contacts.find(c => c.id === contact.id);
        if (!original) return false;
        return contact[field] !== original[field];
      });
    }

    // Apply date range filter
    if (filterOptions.dateRange.start || filterOptions.dateRange.end) {
      filtered = filtered.filter(contact => {
        const contactDate = new Date(contact.createdAt || contact.updatedAt || 0);
        if (filterOptions.dateRange.start && contactDate < filterOptions.dateRange.start) return false;
        if (filterOptions.dateRange.end && contactDate > filterOptions.dateRange.end) return false;
        return true;
      });
    }

    // Apply custom filters
    const applyCustomFilter = (contact: Contact, filter: CustomFilter) => {
      const value = contact[filter.field]?.toString() || '';
      const filterValue = filter.value;
      const filterValue2 = filter.value2;
      
      if (filter.isRegex) {
        try {
          const regex = new RegExp(filterValue, filter.caseSensitive ? '' : 'i');
          return regex.test(value);
        } catch (e) {
          return false;
        }
      }

      const compareValue = filter.caseSensitive ? value : value.toLowerCase();
      const compareFilterValue = filter.caseSensitive ? filterValue : filterValue.toLowerCase();
      const compareFilterValue2 = filter.caseSensitive ? filterValue2 : filterValue2?.toLowerCase();
      
      switch (filter.operator) {
        case 'contains':
          return compareValue.includes(compareFilterValue);
        case 'equals':
          return compareValue === compareFilterValue;
        case 'startsWith':
          return compareValue.startsWith(compareFilterValue);
        case 'endsWith':
          return compareValue.endsWith(compareFilterValue);
        case 'greaterThan':
          return Number(compareValue) > Number(compareFilterValue);
        case 'lessThan':
          return Number(compareValue) < Number(compareFilterValue);
        case 'between':
          if (!compareFilterValue2) return true;
          const numValue = Number(compareValue);
          return numValue >= Number(compareFilterValue) && numValue <= Number(compareFilterValue2);
        case 'dateBefore':
          const dateValue = new Date(compareValue);
          const beforeDate = new Date(compareFilterValue);
          return dateValue < beforeDate;
        case 'dateAfter':
          const afterDate = new Date(compareFilterValue);
          return new Date(compareValue) > afterDate;
        case 'dateBetween':
          if (!compareFilterValue2) return true;
          const date = new Date(compareValue);
          const startDate = new Date(compareFilterValue);
          const endDate = new Date(compareFilterValue2);
          return date >= startDate && date <= endDate;
        case 'matchesPattern':
          try {
            const pattern = new RegExp(filter.validationPattern || '');
            return pattern.test(value);
          } catch (e) {
            return false;
          }
        case 'customValidation':
          try {
            const validate = new Function('value', filter.customFunction || 'return true;');
            return validate(value);
          } catch (e) {
            return false;
          }
        default:
          return true;
      }
    };

    // Apply filter groups
    if (filterOptions.filterGroups.length > 0) {
      filtered = filtered.filter(contact => {
        return filterOptions.filterGroups.every((group: FilterGroup) => {
          if (group.filters.length === 0) return true;
          
          const groupResult = group.filters.map((filter: CustomFilter) => applyCustomFilter(contact, filter));
          return group.combination === 'AND' 
            ? groupResult.every((result: boolean) => result)
            : groupResult.some((result: boolean) => result);
        });
      });
    }

    // Apply main custom filters
    if (filterOptions.customFilters.length > 0) {
      const filterResults = filterOptions.customFilters.map((filter: CustomFilter) =>
        filtered.map((contact: Contact) => applyCustomFilter(contact, filter))
      );

      filtered = filtered.filter((_, index) => {
        const results = filterResults.map((result: boolean[]) => result[index]);
        return filterOptions.filterCombination === 'AND'
          ? results.every((result: boolean) => result)
          : results.some((result: boolean) => result);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      if (aValue === bValue) return 0;
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const handleUndo = () => {
    if (historyIndex < 0) return;

    const operation = operationHistory[historyIndex];
    if (operation.type === 'edit') {
      setPreviewContacts(prev => {
        const newContacts = [...prev];
        operation.contacts.forEach(originalContact => {
          const index = newContacts.findIndex(c => c.id === originalContact.id);
          if (index !== -1) {
            newContacts[index] = { ...originalContact };
          }
        });
        return newContacts;
      });
    } else if (operation.type === 'delete') {
      setPreviewContacts(prev => [...prev, ...operation.contacts]);
    } else if (operation.type === 'group') {
      // Handle grouped operations
      operation.contacts.forEach(contact => {
        if (contact.id.startsWith('group_')) {
          // Handle filter group operations
          setFilterOptions(prev => ({
            ...prev,
            filterGroups: prev.filterGroups.filter(g => g.id !== contact.id)
          }));
        }
      });
    }

    setHistoryIndex(prev => prev - 1);
  };

  const handleRedo = () => {
    if (historyIndex >= operationHistory.length - 1) return;

    const operation = operationHistory[historyIndex + 1];
    if (operation.type === 'edit') {
      setPreviewContacts(prev => {
        const newContacts = [...prev];
        operation.preview?.forEach(editedContact => {
          const index = newContacts.findIndex(c => c.id === editedContact.id);
          if (index !== -1) {
            newContacts[index] = { ...editedContact };
          }
        });
        return newContacts;
      });
    } else if (operation.type === 'delete') {
      setPreviewContacts(prev => 
        prev.filter(c => !operation.contacts.some(dc => dc.id === c.id))
      );
    } else if (operation.type === 'group') {
      // Handle grouped operations
      operation.contacts.forEach(contact => {
        if (contact.id.startsWith('group_')) {
          // Handle filter group operations
          setFilterOptions(prev => ({
            ...prev,
            filterGroups: [...prev.filterGroups, {
              id: contact.id,
              filters: [],
              combination: 'AND',
              level: 0
            }]
          }));
        }
      });
    }

    setHistoryIndex(prev => prev + 1);
  };

  const handleFilterGroupSelect = (groupId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedFilterGroups(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(groupId)) {
          newSelected.delete(groupId);
        } else {
          newSelected.add(groupId);
        }
        return newSelected;
      });
    } else {
      setSelectedFilterGroups(new Set([groupId]));
    }
  };

  const handleFilterGroupDragStart = (groupId: string, event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', groupId);
    setDraggedFilterGroup(groupId);
    
    if (selectedFilterGroups.has(groupId)) {
      event.dataTransfer.setData('selectedGroups', JSON.stringify(Array.from(selectedFilterGroups)));
    }
  };

  const handleFilterGroupDragOver = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggedFilterGroup === targetGroupId) return;

    const selectedGroups = e.dataTransfer.getData('selectedGroups');
    const groupsToMove = selectedGroups ? JSON.parse(selectedGroups) : [draggedFilterGroup];

    setFilterOptions(prev => {
      const groups = [...prev.filterGroups];
      const targetIndex = groups.findIndex(g => g.id === targetGroupId);
      
      // Remove all selected groups
      const remainingGroups = groups.filter(g => !groupsToMove.includes(g.id));
      
      // Insert at target position
      remainingGroups.splice(targetIndex, 0, ...groups.filter(g => groupsToMove.includes(g.id)));
      
      return { ...prev, filterGroups: remainingGroups };
    });
  };

  const handleFilterGroupDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const selectedGroups = e.dataTransfer.getData('selectedGroups');
    
    if (selectedGroups) {
      const groupsToMove = JSON.parse(selectedGroups);
      if (groupsToMove.includes(targetGroupId)) {
        // Handle nested group creation
        const parentGroup = filterOptions.filterGroups.find(g => g.id === targetGroupId);
        if (parentGroup) {
          setFilterOptions(prev => ({
            ...prev,
            filterGroups: prev.filterGroups.map(g => 
              groupsToMove.includes(g.id) && g.id !== targetGroupId
                ? { ...g, parentGroupId: targetGroupId, level: (parentGroup.level || 0) + 1 }
                : g
            )
          }));
        }
      }
    }
    
    setDraggedFilterGroup(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault();
            handlePauseResume();
            break;
          case 's':
            event.preventDefault();
            if (activeStep === 'save') handleSaveContacts();
            break;
          case 'h':
            event.preventDefault();
            setShowHelp(prev => !prev);
            break;
          case 'a':
            event.preventDefault();
            if (showPreview) handleSelectAll();
            break;
          case 'r':
            event.preventDefault();
            if (showPreview && selectedContacts.size > 0) handleBulkRevert();
            break;
          case 'e':
            event.preventDefault();
            if (showPreview && selectedContacts.size > 0) handleExportSelected();
            break;
          case 'f':
            event.preventDefault();
            if (showPreview) {
              const searchInput = document.querySelector('.filter-controls input[type="text"]') as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeStep, showPreview, selectedContacts.size]);

  // Drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFile(file);
      handleFileUpload({ target: { files: [file] } } as any);
    }
  }, []);

  // Helper function for merging contacts
  const mergeContacts = (
    newContact: Contact,
    existingContact: Contact,
    strategy: MergeStrategy,
    customRules: typeof customMergeRules
  ): Contact => {
    const merged: Contact = { ...newContact };

    // Apply custom merge rules if specified
    if (customRules.length > 0) {
      customRules.forEach(rule => {
        const newValue = newContact[rule.field];
        const existingValue = existingContact[rule.field];

        switch (rule.strategy) {
          case 'prefer_new':
            (merged as any)[rule.field] = newValue;
            break;
          case 'prefer_existing':
            (merged as any)[rule.field] = existingValue;
            break;
          case 'combine':
            if (typeof newValue === 'string' && typeof existingValue === 'string') {
              // Special handling for name fields
              if (rule.field === 'firstName' || rule.field === 'lastName') {
                const values = [existingValue, newValue].filter(Boolean);
                (merged as any)[rule.field] = values.join(' ');
              } else {
                (merged as any)[rule.field] = `${existingValue}, ${newValue}`;
              }
            }
            break;
          case 'custom':
            if (rule.customFunction) {
              try {
                const mergeFunc = new Function('newValue', 'existingValue', rule.customFunction);
                (merged as any)[rule.field] = mergeFunc(newValue, existingValue);
              } catch (e) {
                console.error('Error executing custom merge function:', e);
              }
            }
            break;
        }
      });
    } else {
      // Apply default merge strategy
      switch (strategy) {
        case 'prefer_new':
          merged.firstName = newContact.firstName;
          merged.lastName = newContact.lastName;
          merged.email = newContact.email;
          merged.phone = newContact.phone;
          merged.company = newContact.company;
          merged.title = newContact.title;
          break;
        case 'prefer_existing':
          merged.firstName = existingContact.firstName;
          merged.lastName = existingContact.lastName;
          merged.email = existingContact.email;
          merged.phone = existingContact.phone;
          merged.company = existingContact.company;
          merged.title = existingContact.title;
          break;
        case 'combine':
          // Special handling for name fields
          merged.firstName = [existingContact.firstName, newContact.firstName].filter(Boolean).join(' ');
          merged.lastName = [existingContact.lastName, newContact.lastName].filter(Boolean).join(' ');
          merged.email = existingContact.email ? `${existingContact.email}, ${newContact.email}` : newContact.email;
          merged.phone = existingContact.phone ? `${existingContact.phone}, ${newContact.phone}` : newContact.phone;
          merged.company = existingContact.company ? `${existingContact.company}, ${newContact.company}` : newContact.company;
          merged.title = existingContact.title ? `${existingContact.title}, ${newContact.title}` : newContact.title;
          break;
      }
    }

    // Validate name fields after merge
    if (!merged.firstName && !merged.lastName) {
      // If both name fields are empty, try to extract from email or other fields
      const emailName = merged.email?.split('@')[0]?.replace(/[._-]/g, ' ');
      if (emailName) {
        const parts = emailName.split(' ');
        merged.firstName = parts[0];
        merged.lastName = parts.slice(1).join(' ');
      }
    }

    // Merge additional fields
    if (existingContact.additionalFields) {
      merged.additionalFields = {
        ...existingContact.additionalFields,
        ...newContact.additionalFields,
        mergeHistory: {
          mergedAt: new Date(),
          strategy,
          customRules,
          originalValues: {
            existing: existingContact,
            new: newContact
          }
        }
      };
    }

    // Update analytics
    setImportAnalytics(prev => ({ ...prev, mergedContacts: prev.mergedContacts + 1 }));

    return merged;
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupResources({
        setContacts,
        setSimilarityGroups,
        setPreviewContacts,
        setOperationHistory,
        setHistoryIndex
      });
    };
  }, []);

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>Drag and drop a CSV or JSON file here, or click to select</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: CSV, JSON
          </p>
        </div>
      </div>

      {state.isImporting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {state.stage.charAt(0).toUpperCase() + state.stage.slice(1)}
            </span>
            <span className="text-sm text-gray-500">{state.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.stats.total > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Summary</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Contacts</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{state.stats.total}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Valid Contacts</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600">{state.stats.valid}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Invalid Contacts</dt>
              <dd className="mt-1 text-2xl font-semibold text-red-600">{state.stats.invalid}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Potential Duplicates</dt>
              <dd className="mt-1 text-2xl font-semibold text-yellow-600">{state.stats.duplicates}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Normalized</dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-600">{state.stats.normalized}</dd>
            </div>
          </dl>
        </div>
      )}

      {state.errors.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Import Errors</h3>
          <ul className="space-y-2">
            {state.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error.message}
                {error.details && (
                  <p className="mt-1 text-xs text-red-600">{error.details.stack}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.duplicates.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Potential Duplicates</h3>
          <div className="space-y-4">
            {state.duplicates.map((group, index) => (
              <div key={index} className="bg-white rounded p-3">
                <h4 className="font-medium text-yellow-900 mb-2">Group {index + 1}</h4>
                <ul className="space-y-2">
                  {group.map((contact, contactIndex) => (
                    <li key={contactIndex} className="text-sm text-yellow-800">
                      {contact.firstName} {contact.lastName}
                      {contact.email && ` (${contact.email})`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.stage === 'complete' && state.normalizedContacts.length > 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={resetState}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveContacts}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Contacts
          </button>
        </div>
      )}
    </div>
  );
};

function parseCSV(text: string): Contact[] {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const contact: Contact = {
      id: '',
      email: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (!value) return;
      
      switch (header) {
        case 'first name':
        case 'firstname':
        case 'first_name':
          contact.firstName = value;
          break;
        case 'last name':
        case 'lastname':
        case 'last_name':
          contact.lastName = value;
          break;
        case 'email':
          contact.email = value;
          break;
        case 'phone':
        case 'phone number':
        case 'phone_number':
          contact.phone = value;
          break;
        case 'company':
          contact.company = value;
          break;
        case 'title':
        case 'job title':
        case 'job_title':
          contact.title = value;
          break;
        default:
          if (!contact.additionalFields) {
            contact.additionalFields = {};
          }
          contact.additionalFields[header] = value;
      }
    });
    
    return contact;
  });
}

function parseJSON(text: string): Contact[] {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new ImportError('PARSE_ERROR', 'Invalid JSON format');
  }
}

export default ContactImport; 