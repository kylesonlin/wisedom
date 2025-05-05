import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Contact } from '../types/contact';
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
  ImportErrorLogger
} from '../utils/errorHandling';
import { ErrorReportingService } from '../services/errorReporting';
import { ErrorRecoveryService } from '../services/errorRecovery';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProcessingStage = 'parsing' | 'normalizing' | 'deduplicating' | 'saving';

// Add new types for enhanced functionality
type ConflictResolutionStrategy = 'merge' | 'skip' | 'keep_both' | 'custom';
type MergeStrategy = 'prefer_new' | 'prefer_existing' | 'combine' | 'custom';
type ImportAnalytics = {
  totalContacts: number;
  duplicatesFound: number;
  conflictsDetected: number;
  mergedContacts: number;
  skippedContacts: number;
  normalizationStats: {
    emailsNormalized: number;
    phonesNormalized: number;
    namesNormalized: number;
  };
  processingTime: number;
  errorCount: number;
  warningCount: number;
};

const ContactImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [similarityGroups, setSimilarityGroups] = useState<Contact[][]>([]);
  const [error, setError] = useState<ImportError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'csv' | 'json' | 'vcard'>('auto');
  const [showHelp, setShowHelp] = useState(false);
  const [activeStep, setActiveStep] = useState<'upload' | 'review' | 'save'>('upload');
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('parsing');
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
  const [filterOptions, setFilterOptions] = useState({
    searchTerm: '',
    field: 'all' as 'all' | keyof Contact,
    hasChanges: 'all' as 'all' | 'changed' | 'unchanged',
    normalizationType: 'all' as 'all' | 'email' | 'phone' | 'name' | 'company' | 'title',
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    },
    customFilters: [] as Array<{
      field: keyof Contact;
      operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'custom' | 'greaterThan' | 'lessThan' | 'between' | 'dateBefore' | 'dateAfter' | 'dateBetween' | 'matchesPattern' | 'customValidation';
      value: string;
      value2?: string;
      customFunction?: string;
      isRegex?: boolean;
      caseSensitive?: boolean;
      validationPattern?: string;
      validationMessage?: string;
    }>,
    filterCombination: 'AND' as 'AND' | 'OR',
    filterGroups: [] as Array<{
      id: string;
      filters: typeof filterOptions.customFilters;
      combination: 'AND' | 'OR';
      parentGroupId?: string;
      level: number;
    }>
  });
  const [sortOptions, setSortOptions] = useState({
    field: 'name' as keyof Contact,
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
  const [bulkEditField, setBulkEditField] = useState<keyof Contact>('name');
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
  const [importAnalytics, setImportAnalytics] = useState<ImportAnalytics>({
    totalContacts: 0,
    duplicatesFound: 0,
    conflictsDetected: 0,
    mergedContacts: 0,
    skippedContacts: 0,
    normalizationStats: { emailsNormalized: 0, phonesNormalized: 0, namesNormalized: 0 },
    processingTime: 0,
    errorCount: 0,
    warningCount: 0
  });

  const batchProcessor = BatchProcessingService.getInstance();
  const normalizationService = NormalizationService.getInstance();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setError(null);
    setCurrentStage('parsing');

    try {
      const content = await file.text();
      const format = detectFileFormat(content);
      if (!format) {
        throw new Error('Unsupported file format');
      }

      const contacts = parseFileContent(content, format);
      setContacts(contacts);
      setActiveStep('review');
    } catch (err) {
      setError(createError(ImportErrorType.FILE_PARSE, 'Failed to process file', err));
    }
  };

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

      const result = await batchProcessor.processContacts(contacts, {
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
            namesNormalized: normalizedContacts.filter(c => c.name !== contacts.find(oc => oc.id === c.id)?.name).length
          }));
        }
      });

      setSimilarityGroups(result.similarityGroups);
      setBatchStats(result.batchStats);
      setActiveStep('save');
    } catch (err) {
      setError(createError(ImportErrorType.UNKNOWN, 'Failed to process contacts', err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveContacts = async () => {
    setIsProcessing(true);
    setCurrentStage('saving');
    setError(null);
    const startTime = Date.now();

    try {
      // Validate contacts before saving
      const validationErrors = contacts.filter(contact => !contact.name);
      if (validationErrors.length > 0) {
        throw new Error(`Found ${validationErrors.length} contacts without names`);
      }

      // Check for existing contacts with enhanced matching
      const { data: existingContacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, email, phone, name, company, title, additionalFields')
        .in('email', contacts.map(c => c.email).filter(Boolean))
        .or(`phone.in.(${contacts.map(c => c.phone).filter(Boolean).join(',')})`);

      if (fetchError) throw fetchError;

      // Prepare contacts for saving with enhanced metadata
      const contactsToSave = contacts.map(contact => ({
        ...contact,
        source: contact.source || 'manual_import',
        createdAt: new Date(),
        updatedAt: new Date(),
        additionalFields: {
          ...contact.additionalFields,
          importBatch: new Date().toISOString(),
          importSource: 'file_import',
          importMetadata: {
            originalName: contact.name,
            originalEmail: contact.email,
            originalPhone: contact.phone,
            normalizationStats: {
              emailChanged: contact.email !== contacts.find(c => c.id === contact.id)?.email,
              phoneChanged: contact.phone !== contacts.find(c => c.id === contact.id)?.phone,
              nameChanged: contact.name !== contacts.find(c => c.id === contact.id)?.name
            },
            processingHistory: {
              normalizedAt: new Date(),
              normalizedBy: 'system',
              normalizationRules: customRules
            }
          }
        }
      }));

      // Enhanced conflict detection
      const conflicts = contactsToSave.filter(contact => 
        existingContacts?.some(existing => isPotentialDuplicate(contact, existing))
      );

      // Update analytics
      setImportAnalytics(prev => ({
        ...prev,
        totalContacts: contacts.length,
        conflictsDetected: conflicts.length,
        duplicatesFound: similarityGroups.filter(g => g.length > 1).length
      }));

      if (conflicts.length > 0) {
        // Create a new batch for conflicted contacts with enhanced metadata
        const { data: batch, error: batchError } = await supabase
          .from('contact_batches')
          .insert({
            type: 'conflict_resolution',
            status: 'pending',
            createdAt: new Date(),
            metadata: {
              totalConflicts: conflicts.length,
              source: 'file_import',
              resolutionStrategy: conflictResolutionStrategy,
              mergeStrategy: mergeStrategy,
              customMergeRules: customMergeRules
            }
          })
          .select()
          .single();

        if (batchError) throw batchError;

        // Handle conflicts based on selected strategy
        const resolvedContacts = await Promise.all(conflicts.map(async contact => {
          const existing = existingContacts?.find(existing => 
            (contact.email && existing.email === contact.email) ||
            (contact.phone && existing.phone === contact.phone)
          );

          if (!existing) return contact;

          switch (conflictResolutionStrategy) {
            case 'merge':
              return mergeContacts(contact, existing, mergeStrategy, customMergeRules);
            case 'skip':
              setImportAnalytics(prev => ({ ...prev, skippedContacts: prev.skippedContacts + 1 }));
              return null;
            case 'keep_both':
              return { ...contact, additionalFields: { ...contact.additionalFields, conflictId: existing.id } };
            case 'custom':
              // Implement custom conflict resolution logic here
              return contact;
          }
        }));

        // Filter out skipped contacts
        const contactsToSave = resolvedContacts.filter(Boolean);

        // Save resolved contacts
        if (contactsToSave.length > 0) {
          const { error: saveError } = await supabase
            .from('contacts')
            .insert(contactsToSave);

          if (saveError) throw saveError;
        }

        // Create enhanced notification for conflicts
        await supabase
          .from('notifications')
          .insert({
            type: 'contact_conflicts',
            message: `Found ${conflicts.length} potential conflicts during import`,
            metadata: {
              batchId: batch.id,
              conflictCount: conflicts.length,
              resolutionStrategy: conflictResolutionStrategy,
              mergeStrategy: mergeStrategy,
              resolvedCount: contactsToSave.length
            },
            createdAt: new Date()
          });
      } else {
        // Save all contacts if no conflicts
        const { error: saveError } = await supabase
          .from('contacts')
          .insert(contactsToSave);

        if (saveError) throw saveError;
      }

      // Create detailed import history record
      const processingTime = Date.now() - startTime;
      await supabase
        .from('import_history')
        .insert({
          type: 'file_import',
          status: 'completed',
          totalContacts: contacts.length,
          duplicatesFound: similarityGroups.filter(g => g.length > 1).length,
          conflictsDetected: conflicts.length,
          mergedContacts: importAnalytics.mergedContacts,
          skippedContacts: importAnalytics.skippedContacts,
          normalizationStats: {
            emailsNormalized: normalizationStats.emailsNormalized,
            phonesNormalized: normalizationStats.phonesNormalized,
            namesNormalized: normalizationStats.namesNormalized
          },
          batchStats: batchStats,
          processingTime,
          errorCount: importAnalytics.errorCount,
          warningCount: importAnalytics.warningCount,
          metadata: {
            conflictResolutionStrategy,
            mergeStrategy,
            customMergeRules,
            normalizationRules: customRules
          },
          createdAt: new Date()
        });

      // Reset state
      setActiveStep('upload');
      setContacts([]);
      setSimilarityGroups([]);
      setPreviewContacts([]);
      setNormalizationStats({ emailsNormalized: 0, phonesNormalized: 0, namesNormalized: 0 });
      setBatchStats({ totalBatches: 0, processedBatches: 0, failedBatches: 0, duplicatesPerBatch: {} });
    } catch (err) {
      setError(createError(ImportErrorType.DATABASE, 'Failed to save contacts', err));
      
      // Enhanced error logging
      await supabase
        .from('error_logs')
        .insert({
          type: 'contact_import',
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          metadata: {
            contactCount: contacts.length,
            stage: currentStage,
            conflictResolutionStrategy,
            mergeStrategy,
            customMergeRules,
            normalizationRules: customRules
          },
          createdAt: new Date()
        });

      // Update analytics
      setImportAnalytics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
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
        field: 'name',
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
        combination: 'AND'
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
        contact[bulkEditField] = newValue as any;
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
          
          contact[mapping.targetField] = targetValue as any;
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

        contact[bulkEditField] = newValue as any;
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
          timestamp: Date.now()
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
    const csv = convertContactsToCSV(contactsToExport);
    downloadCSV(csv, 'exported_contacts.csv');
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
      filtered = filtered.filter(contact => 
        contact[filterOptions.field] !== undefined && 
        contact[filterOptions.field] !== null
      );
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
      filtered = filtered.filter(contact => {
        const original = contacts.find(c => c.id === contact.id);
        if (!original) return false;
        return contact[filterOptions.normalizationType] !== original[filterOptions.normalizationType];
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
    const applyCustomFilter = (contact: Contact, filter: typeof filterOptions.customFilters[0]) => {
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
        return filterOptions.filterGroups.every(group => {
          if (group.filters.length === 0) return true;
          
          const groupResult = group.filters.map(filter => applyCustomFilter(contact, filter));
          return group.combination === 'AND' 
            ? groupResult.every(result => result)
            : groupResult.some(result => result);
        });
      });
    }

    // Apply main custom filters
    if (filterOptions.customFilters.length > 0) {
      const filterResults = filterOptions.customFilters.map(filter => 
        filtered.map(contact => applyCustomFilter(contact, filter))
      );

      filtered = filtered.filter((_, index) => {
        const results = filterResults.map(result => result[index]);
        return filterOptions.filterCombination === 'AND'
          ? results.every(result => result)
          : results.some(result => result);
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
            merged[rule.field] = newValue;
            break;
          case 'prefer_existing':
            merged[rule.field] = existingValue;
            break;
          case 'combine':
            if (typeof newValue === 'string' && typeof existingValue === 'string') {
              merged[rule.field] = `${existingValue}, ${newValue}`;
            }
            break;
          case 'custom':
            if (rule.customFunction) {
              try {
                const mergeFunc = new Function('newValue', 'existingValue', rule.customFunction);
                merged[rule.field] = mergeFunc(newValue, existingValue);
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
          merged.name = newContact.name;
          merged.email = newContact.email;
          merged.phone = newContact.phone;
          merged.company = newContact.company;
          merged.title = newContact.title;
          break;
        case 'prefer_existing':
          merged.name = existingContact.name;
          merged.email = existingContact.email;
          merged.phone = existingContact.phone;
          merged.company = existingContact.company;
          merged.title = existingContact.title;
          break;
        case 'combine':
          merged.name = `${existingContact.name} (${newContact.name})`;
          merged.email = existingContact.email ? `${existingContact.email}, ${newContact.email}` : newContact.email;
          merged.phone = existingContact.phone ? `${existingContact.phone}, ${newContact.phone}` : newContact.phone;
          merged.company = existingContact.company ? `${existingContact.company}, ${newContact.company}` : newContact.company;
          merged.title = existingContact.title ? `${existingContact.title}, ${newContact.title}` : newContact.title;
          break;
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

  // Add this utility function for duplicate detection
  function isPotentialDuplicate(contactA: Contact, contactB: Contact): boolean {
    const emailMatch = contactA.email && contactB.email && contactA.email === contactB.email;
    const phoneMatch = contactA.phone && contactB.phone && contactA.phone === contactB.phone;
    const nameMatch = contactA.name && contactB.name && contactA.name.trim().toLowerCase() === contactB.name.trim().toLowerCase();
    // Flag as potential duplicate if:
    // - Email matches, or
    // - Phone matches, or
    // - Name matches AND (email or phone exists for both)
    return (
      emailMatch ||
      phoneMatch ||
      (nameMatch && (contactA.email || contactA.phone) && (contactB.email || contactB.phone))
    );
  }

  return (
    <div className="contact-import">
      <div className="header-section">
        <h2>Import Contacts</h2>
        <button
          className="help-button"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="Toggle help"
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>

      {showHelp && (
        <div className="help-section">
          <h3>Import Guide</h3>
          <div className="help-steps">
            <div className={`help-step ${activeStep === 'upload' ? 'active' : ''}`}>
              <h4>1. Upload Contacts</h4>
              <p>Choose your file format and upload your contact list. Supported formats: CSV, JSON, vCard.</p>
            </div>
            <div className={`help-step ${activeStep === 'review' ? 'active' : ''}`}>
              <h4>2. Review Similar Contacts</h4>
              <p>Review and merge similar contacts. Adjust the similarity threshold to control matching sensitivity.</p>
            </div>
            <div className={`help-step ${activeStep === 'save' ? 'active' : ''}`}>
              <h4>3. Save Contacts</h4>
              <p>Save your normalized contacts to the database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="step-indicator">
        <div className={`step ${activeStep === 'upload' ? 'active' : ''}`}>
          <span>1. Upload</span>
        </div>
        <div className={`step ${activeStep === 'review' ? 'active' : ''}`}>
          <span>2. Review</span>
        </div>
        <div className={`step ${activeStep === 'save' ? 'active' : ''}`}>
          <span>3. Save</span>
        </div>
      </div>

      {activeStep === 'upload' && (
        <div 
          className="file-upload"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".csv,.json,.vcf"
          />
          <div className="format-selector">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
            >
              <option value="auto">Auto-detect</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="vcard">vCard</option>
            </select>
            <span className="format-hint">
              {selectedFormat === 'auto' ? 'We\'ll detect the format automatically' : 
               selectedFormat === 'csv' ? 'CSV should have headers: name,email,phone,company,title' :
               selectedFormat === 'json' ? 'JSON should be an array of contact objects' :
               'vCard should be in standard vCard format'}
            </span>
          </div>
          <div className="drag-drop-hint">
            Or drag and drop your file here
          </div>
        </div>
      )}

      {activeStep === 'review' && (
        <div className="review-section">
          <div className="custom-rules">
            <h3>Custom Normalization Rules</h3>
            {customRules.map((rule, index) => (
              <div key={index} className="rule-editor">
                <select
                  value={rule.field}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules[index].field = e.target.value as keyof Contact;
                    setCustomRules(newRules);
                  }}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="title">Title</option>
                </select>
                <input
                  type="text"
                  value={rule.pattern}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules[index].pattern = e.target.value;
                    setCustomRules(newRules);
                  }}
                  placeholder="Pattern (regex)"
                />
                <input
                  type="text"
                  value={rule.replacement}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules[index].replacement = e.target.value;
                    setCustomRules(newRules);
                  }}
                  placeholder="Replacement"
                />
                <input
                  type="text"
                  value={rule.description}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules[index].description = e.target.value;
                    setCustomRules(newRules);
                  }}
                  placeholder="Description"
                />
                <button onClick={() => handleRemoveCustomRule(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button onClick={handleAddCustomRule}>
              Add Custom Rule
            </button>
          </div>

          <div className="preview-section">
            <button onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {showPreview && (
              <div className="preview-content">
                <div className="preview-controls">
                  <div className="filter-controls">
                    <input
                      type="text"
                      placeholder="Search contacts... (Ctrl/Cmd + F)"
                      value={filterOptions.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                    <select
                      value={filterOptions.field}
                      onChange={(e) => handleFilterChange('field', e.target.value)}
                    >
                      <option value="all">All Fields</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="company">Company</option>
                      <option value="title">Title</option>
                    </select>
                    <select
                      value={filterOptions.hasChanges}
                      onChange={(e) => handleFilterChange('hasChanges', e.target.value)}
                    >
                      <option value="all">All Contacts</option>
                      <option value="changed">Changed Only</option>
                      <option value="unchanged">Unchanged Only</option>
                    </select>
                    <select
                      value={filterOptions.normalizationType}
                      onChange={(e) => handleFilterChange('normalizationType', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="email">Email Changes</option>
                      <option value="phone">Phone Changes</option>
                      <option value="name">Name Changes</option>
                      <option value="company">Company Changes</option>
                      <option value="title">Title Changes</option>
                    </select>
                    <div className="date-range">
                      <input
                        type="date"
                        value={filterOptions.dateRange.start?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleDateRangeChange(
                          e.target.value ? new Date(e.target.value) : null,
                          filterOptions.dateRange.end
                        )}
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={filterOptions.dateRange.end?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleDateRangeChange(
                          filterOptions.dateRange.start,
                          e.target.value ? new Date(e.target.value) : null
                        )}
                      />
                    </div>
                    <button onClick={handleCustomFilterAdd}>
                      Add Custom Filter
                    </button>
                    <button onClick={() => setShowFilterPresetModal(true)}>
                      Save Preset
                    </button>
                  </div>
                  <div className="custom-filters">
                    {filterOptions.customFilters.map((filter, index) => (
                      <div key={index} className="custom-filter">
                        <select
                          value={filter.field}
                          onChange={(e) => handleFilterChange('customFilters', prev => prev.map((f, i) => i === index ? { ...f, field: e.target.value as keyof Contact } : f))}
                        >
                          <option value="name">Name</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="company">Company</option>
                          <option value="title">Title</option>
                        </select>
                        <select
                          value={filter.operator}
                          onChange={(e) => handleFilterChange('customFilters', prev => prev.map((f, i) => i === index ? { ...f, operator: e.target.value as typeof filter.operator } : f))}
                        >
                          <option value="contains">Contains</option>
                          <option value="equals">Equals</option>
                          <option value="startsWith">Starts With</option>
                          <option value="endsWith">Ends With</option>
                          <option value="regex">Regex</option>
                          <option value="custom">Custom</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => handleFilterChange('customFilters', prev => prev.map((f, i) => i === index ? { ...f, value: e.target.value } : f))}
                          placeholder="Value"
                        />
                        <button onClick={() => handleFilterGroupRemove(filter.id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="filter-presets">
                    {filterPresets.map((preset, index) => (
                      <div key={index} className="preset">
                        <span>{preset.name}</span>
                        <button onClick={() => handleLoadPreset(preset)}>
                          Load
                        </button>
                        <button onClick={() => handleDeletePreset(index)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="sort-controls">
                    <select
                      value={sortOptions.field}
                      onChange={(e) => handleSortChange('field', e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="company">Company</option>
                      <option value="title">Title</option>
                    </select>
                    <select
                      value={sortOptions.direction}
                      onChange={(e) => handleSortChange('direction', e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
                <div className="preview-stats">
                  <span>Showing {getFilteredAndSortedContacts().length} of {previewContacts.length} contacts</span>
                  <span>Selected: {selectedContacts.size}</span>
                </div>
                <div className="bulk-actions">
                  <button
                    onClick={handleSelectAll}
                    disabled={getFilteredAndSortedContacts().length === 0}
                  >
                    {selectedContacts.size === getFilteredAndSortedContacts().length ? 'Deselect All' : 'Select All'} (Ctrl/Cmd + A)
                  </button>
                  <button
                    onClick={handleBulkRevert}
                    disabled={selectedContacts.size === 0}
                  >
                    Revert Selected (Ctrl/Cmd + R)
                  </button>
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    disabled={selectedContacts.size === 0}
                  >
                    Edit Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedContacts.size === 0}
                    className="danger"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={handleExportSelected}
                    disabled={selectedContacts.size === 0}
                  >
                    Export Selected (Ctrl/Cmd + E)
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex < 0}
                  >
                    Undo (Ctrl/Cmd + Z)
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= operationHistory.length - 1}
                  >
                    Redo (Ctrl/Cmd + Y)
                  </button>
                  <button
                    onClick={() => setShowHistoryPreview(true)}
                    disabled={operationHistory.length === 0}
                  >
                    History Preview
                  </button>
                </div>
                <div className="preview-list">
                  {getFilteredAndSortedContacts().map(contact => {
                    const original = contacts.find(c => c.id === contact.id);
                    return (
                      <div
                        key={contact.id}
                        className={`preview-contact ${selectedContacts.has(contact.id) ? 'selected' : ''}`}
                        onClick={() => handleSelectContact(contact.id)}
                      >
                        <div className="contact-details">
                          <div className={`field ${contact.name !== original?.name ? 'changed' : ''}`}>
                            <span className="label">Name:</span>
                            <span className="value">{contact.name}</span>
                            {contact.name !== original?.name && (
                              <span className="original">(was: {original?.name})</span>
                            )}
                          </div>
                          <div className={`field ${contact.email !== original?.email ? 'changed' : ''}`}>
                            <span className="label">Email:</span>
                            <span className="value">{contact.email}</span>
                            {contact.email !== original?.email && (
                              <span className="original">(was: {original?.email})</span>
                            )}
                          </div>
                          <div className={`field ${contact.phone !== original?.phone ? 'changed' : ''}`}>
                            <span className="label">Phone:</span>
                            <span className="value">{contact.phone}</span>
                            {contact.phone !== original?.phone && (
                              <span className="original">(was: {original?.phone})</span>
                            )}
                          </div>
                          {contact.company && (
                            <div className={`field ${contact.company !== original?.company ? 'changed' : ''}`}>
                              <span className="label">Company:</span>
                              <span className="value">{contact.company}</span>
                              {contact.company !== original?.company && (
                                <span className="original">(was: {original?.company})</span>
                              )}
                            </div>
                          )}
                          {contact.title && (
                            <div className={`field ${contact.title !== original?.title ? 'changed' : ''}`}>
                              <span className="label">Title:</span>
                              <span className="value">{contact.title}</span>
                              {contact.title !== original?.title && (
                                <span className="original">(was: {original?.title})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleRevertChanges(contact);
                        }}>
                          Revert Changes
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {showFilterPresetModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Save Filter Preset</h3>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset Name"
                />
                <div className="modal-actions">
                  <button onClick={handleSavePreset}>Save</button>
                  <button onClick={() => setShowFilterPresetModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showBulkEditModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Bulk Edit Selected Contacts</h3>
                <div className="form-group">
                  <label>Operation:</label>
                  <select
                    value={bulkEditOperation}
                    onChange={(e) => setBulkEditOperation(e.target.value as any)}
                  >
                    <option value="set">Set Value</option>
                    <option value="append">Append</option>
                    <option value="prepend">Prepend</option>
                    <option value="replace">Replace</option>
                    <option value="regexReplace">Regex Replace</option>
                    <option value="findAndReplace">Find and Replace</option>
                    <option value="template">Template</option>
                    <option value="fieldMapping">Field Mapping</option>
                  </select>
                </div>
                {bulkEditOperation === 'template' ? (
                  <div className="form-group">
                    <label>Template:</label>
                    <textarea
                      value={bulkEditTemplate}
                      onChange={(e) => setBulkEditTemplate(e.target.value)}
                      placeholder="Use {field} to insert field values"
                      rows={4}
                    />
                    <div className="template-help">
                      Available fields: {Object.keys(previewContacts[0] || {}).join(', ')}
                    </div>
                  </div>
                ) : bulkEditOperation === 'fieldMapping' ? (
                  <div className="form-group">
                    <label>Field Mappings:</label>
                    {bulkEditFieldMappings.map((mapping, index) => (
                      <div key={index} className="mapping-row">
                        <select
                          value={mapping.sourceField}
                          onChange={(e) => {
                            const newMappings = [...bulkEditFieldMappings];
                            newMappings[index].sourceField = e.target.value as keyof Contact;
                            setBulkEditFieldMappings(newMappings);
                          }}
                        >
                          {Object.keys(previewContacts[0] || {}).map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <span>→</span>
                        <select
                          value={mapping.targetField}
                          onChange={(e) => {
                            const newMappings = [...bulkEditFieldMappings];
                            newMappings[index].targetField = e.target.value as keyof Contact;
                            setBulkEditFieldMappings(newMappings);
                          }}
                        >
                          {Object.keys(previewContacts[0] || {}).map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={mapping.transform || ''}
                          onChange={(e) => {
                            const newMappings = [...bulkEditFieldMappings];
                            newMappings[index].transform = e.target.value;
                            setBulkEditFieldMappings(newMappings);
                          }}
                          placeholder="Transform function (optional)"
                        />
                        <button
                          onClick={() => {
                            setBulkEditFieldMappings(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setBulkEditFieldMappings(prev => [...prev, {
                          sourceField: 'name',
                          targetField: 'name',
                          transform: ''
                        }]);
                      }}
                    >
                      Add Mapping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Field:</label>
                      <select
                        value={bulkEditField}
                        onChange={(e) => setBulkEditField(e.target.value as keyof Contact)}
                      >
                        {Object.keys(previewContacts[0] || {}).map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                    {bulkEditOperation === 'set' && (
                      <div className="form-group">
                        <label>Value:</label>
                        <input
                          type="text"
                          value={bulkEditValue}
                          onChange={(e) => setBulkEditValue(e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>
                    )}
                    {(bulkEditOperation === 'replace' || bulkEditOperation === 'regexReplace' || bulkEditOperation === 'findAndReplace') && (
                      <>
                        <div className="form-group">
                          <label>Find:</label>
                          <input
                            type="text"
                            value={bulkEditFindValue}
                            onChange={(e) => setBulkEditFindValue(e.target.value)}
                            placeholder="Text to find"
                          />
                        </div>
                        <div className="form-group">
                          <label>Replace with:</label>
                          <input
                            type="text"
                            value={bulkEditReplaceValue}
                            onChange={(e) => setBulkEditReplaceValue(e.target.value)}
                            placeholder="Replacement text"
                          />
                        </div>
                        {bulkEditOperation === 'regexReplace' && (
                          <div className="form-group">
                            <label>Regex Flags:</label>
                            <input
                              type="text"
                              value={bulkEditRegexFlags}
                              onChange={(e) => setBulkEditRegexFlags(e.target.value)}
                              placeholder="e.g., gi"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                <div className="modal-actions">
                  <button onClick={handleBulkEdit}>Apply</button>
                  <button onClick={() => setShowBulkEditModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showHistoryPreview && (
            <div className="modal">
              <div className="modal-content">
                <h3>Operation History</h3>
                <div className="history-list">
                  {operationHistory.map((operation, index) => (
                    <div
                      key={index}
                      className={`history-item ${index === historyIndex ? 'current' : ''}`}
                      onClick={() => {
                        setPreviewOperation(operation);
                        setHistoryIndex(index);
                      }}
                    >
                      <div className="history-time">
                        {new Date(operation.timestamp).toLocaleString()}
                      </div>
                      <div className="history-description">
                        {operation.description}
                      </div>
                      {operation.preview && (
                        <div className="history-preview">
                          {operation.preview.slice(0, 3).map(contact => (
                            <div key={contact.id} className="preview-contact">
                              {Object.entries(contact).map(([key, value]) => (
                                <div key={key} className="preview-field">
                                  <span className="field-name">{key}:</span>
                                  <span className="field-value">{value}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                          {operation.preview.length > 3 && (
                            <div className="preview-more">
                              +{operation.preview.length - 3} more contacts
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button onClick={() => setShowHistoryPreview(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeStep === 'save' && (
        <div className="save-section">
          <div className="stats-display">
            <h3>Processing Statistics</h3>
            <div className="stat-group">
              <div className="stat">
                <span className="label">Total Contacts:</span>
                <span className="value">{contacts.length}</span>
              </div>
              <div className="stat">
                <span className="label">Duplicates Found:</span>
                <span className="value">{similarityGroups.filter(g => g.length > 1).length}</span>
              </div>
            </div>
            <div className="stat-group">
              <div className="stat">
                <span className="label">Emails Normalized:</span>
                <span className="value">{normalizationStats.emailsNormalized}</span>
              </div>
              <div className="stat">
                <span className="label">Phones Normalized:</span>
                <span className="value">{normalizationStats.phonesNormalized}</span>
              </div>
              <div className="stat">
                <span className="label">Names Normalized:</span>
                <span className="value">{normalizationStats.namesNormalized}</span>
              </div>
            </div>
            <div className="stat-group">
              <div className="stat">
                <span className="label">Batches Processed:</span>
                <span className="value">{batchStats.processedBatches}/{batchStats.totalBatches}</span>
              </div>
              <div className="stat">
                <span className="label">Failed Batches:</span>
                <span className="value">{batchStats.failedBatches}</span>
              </div>
            </div>
          </div>

          <div className="similarity-groups">
            <h3>Similar Contacts</h3>
            {similarityGroups
              .filter(group => group.length > 1)
              .map((group, index) => (
                <div key={index} className="similarity-group">
                  <h4>Group {index + 1}</h4>
                  {group.map(contact => (
                    <div key={contact.id} className="contact">
                      <div>Name: {contact.name}</div>
                      <div>Email: {contact.email}</div>
                      <div>Phone: {contact.phone}</div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          <button
            onClick={handleSaveContacts}
            disabled={isProcessing}
          >
            Save Contacts
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="progress-section">
          <div className="stage-indicator">
            Current Stage: {currentStage}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {error && (
        <div className="error-section">
          <div className="error-message">
            {formatErrorForDisplay(error)}
          </div>
          <div className="error-details">
            {getErrorResolutionSteps(error)}
          </div>
          {isRecoverableError(error) && (
            <button onClick={() => setError(null)}>
              Try Again
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .preview-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filter-controls, .sort-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-controls input,
        .filter-controls select,
        .sort-controls select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 150px;
        }

        .preview-stats {
          margin-bottom: 10px;
          color: #666;
          font-size: 0.9em;
        }

        .preview-list {
          max-height: 500px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .preview-contact {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .preview-contact:last-child {
          border-bottom: none;
        }

        .contact-details {
          margin-bottom: 10px;
        }

        .field {
          margin-bottom: 5px;
        }

        .field.changed {
          background-color: #f0f7ff;
          padding: 5px;
          border-radius: 4px;
        }

        .label {
          font-weight: bold;
          margin-right: 5px;
          min-width: 60px;
          display: inline-block;
        }

        .value {
          color: #333;
        }

        .original {
          color: #666;
          font-size: 0.9em;
          margin-left: 10px;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .custom-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 10px 0;
        }

        .custom-filter {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .filter-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 10px 0;
        }

        .preset {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        .bulk-actions {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }

        .preview-contact {
          cursor: pointer;
        }

        .preview-contact.selected {
          background-color: #e3f2fd;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 4px;
          min-width: 300px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .danger {
          background-color: #ff4444;
          color: white;
        }

        .danger:hover {
          background-color: #cc0000;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group select,
        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .filter-group {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          background-color: #f9f9f9;
          cursor: move;
        }

        .filter-group.dragging {
          opacity: 0.5;
        }

        .filter-group.drag-over {
          border-color: #2196F3;
          background-color: #E3F2FD;
        }

        .template-help {
          font-size: 0.8em;
          color: #666;
          margin-top: 5px;
        }

        .mapping-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .history-list {
          max-height: 400px;
          overflow-y: auto;
          margin: 20px 0;
        }

        .history-item {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .history-item:hover {
          background-color: #f5f5f5;
        }

        .history-item.current {
          border-color: #2196F3;
          background-color: #E3F2FD;
        }

        .history-time {
          font-size: 0.8em;
          color: #666;
        }

        .history-description {
          margin: 5px 0;
          font-weight: bold;
        }

        .history-preview {
          margin-top: 10px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        .preview-contact {
          margin-bottom: 10px;
          padding: 5px;
          border-bottom: 1px solid #eee;
        }

        .preview-field {
          display: flex;
          gap: 10px;
        }

        .preview-more {
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .filter-group {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          background-color: #f9f9f9;
          cursor: move;
          position: relative;
        }

        .filter-group.selected {
          border-color: #2196F3;
          background-color: #E3F2FD;
        }

        .filter-group.dragging {
          opacity: 0.5;
        }

        .filter-group.drag-over {
          border-color: #2196F3;
          background-color: #E3F2FD;
        }

        .filter-group-level-1 {
          margin-left: 20px;
        }

        .filter-group-level-2 {
          margin-left: 40px;
        }
      `}</style>
    </div>
  );
};

export default ContactImport; 