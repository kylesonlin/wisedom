import { Contact } from '../types/contact';

interface NormalizationRule {
  field: keyof Contact;
  pattern: RegExp;
  replacement: string;
  description: string;
}

interface NormalizationChange {
  field: keyof Contact;
  originalValue: string;
  normalizedValue: string;
  ruleApplied: string;
  timestamp: Date;
}

interface NormalizationStats {
  totalChanges: number;
  changesByField: Record<keyof Contact, number>;
  changesByRule: Record<string, number>;
  changesByType: {
    email: number;
    phone: number;
    name: number;
    company: number;
    title: number;
  };
  detailedChanges: NormalizationChange[];
}

export class NormalizationService {
  private static instance: NormalizationService;
  private defaultRules: NormalizationRule[] = [
    {
      field: 'email',
      pattern: /[^a-zA-Z0-9@._-]/g,
      replacement: '',
      description: 'Remove invalid characters from email'
    },
    {
      field: 'phone',
      pattern: /[^0-9+]/g,
      replacement: '',
      description: 'Remove non-numeric characters from phone'
    },
    {
      field: 'name',
      pattern: /\s+/g,
      replacement: ' ',
      description: 'Normalize whitespace in names'
    }
  ];
  private customRules: NormalizationRule[] = [];
  private changes: NormalizationChange[] = [];

  private constructor() {}

  static getInstance(): NormalizationService {
    if (!NormalizationService.instance) {
      NormalizationService.instance = new NormalizationService();
    }
    return NormalizationService.instance;
  }

  addCustomRule(rule: NormalizationRule): void {
    this.customRules.push(rule);
  }

  removeCustomRule(index: number): void {
    this.customRules.splice(index, 1);
  }

  getRules(): NormalizationRule[] {
    return [...this.defaultRules, ...this.customRules];
  }

  previewNormalization(contact: Contact): {
    normalized: Contact;
    changes: NormalizationChange[];
  } {
    const normalized = { ...contact };
    const changes: NormalizationChange[] = [];

    const allRules = this.getRules();
    
    allRules.forEach(rule => {
      const originalValue = contact[rule.field];
      if (typeof originalValue === 'string') {
        const normalizedValue = originalValue.replace(rule.pattern, rule.replacement);
        if (normalizedValue !== originalValue) {
          normalized[rule.field] = normalizedValue;
          changes.push({
            field: rule.field,
            originalValue,
            normalizedValue,
            ruleApplied: rule.description,
            timestamp: new Date()
          });
        }
      }
    });

    return { normalized, changes };
  }

  normalizeContact(contact: Contact): {
    normalized: Contact;
    changes: NormalizationChange[];
  } {
    const result = this.previewNormalization(contact);
    this.changes.push(...result.changes);
    return result;
  }

  normalizeContacts(contacts: Contact[]): {
    normalized: Contact[];
    stats: NormalizationStats;
  } {
    const normalized: Contact[] = [];
    const stats: NormalizationStats = {
      totalChanges: 0,
      changesByField: {} as Record<keyof Contact, number>,
      changesByRule: {},
      changesByType: {
        email: 0,
        phone: 0,
        name: 0,
        company: 0,
        title: 0
      },
      detailedChanges: []
    };

    contacts.forEach(contact => {
      const result = this.normalizeContact(contact);
      normalized.push(result.normalized);
      
      result.changes.forEach(change => {
        stats.totalChanges++;
        
        // Update changes by field
        if (!stats.changesByField[change.field]) {
          stats.changesByField[change.field] = 0;
        }
        stats.changesByField[change.field]++;

        // Update changes by rule
        if (!stats.changesByRule[change.ruleApplied]) {
          stats.changesByRule[change.ruleApplied] = 0;
        }
        stats.changesByRule[change.ruleApplied]++;

        // Update changes by type
        if (change.field === 'email') stats.changesByType.email++;
        if (change.field === 'phone') stats.changesByType.phone++;
        if (change.field === 'name') stats.changesByType.name++;
        if (change.field === 'company') stats.changesByType.company++;
        if (change.field === 'title') stats.changesByType.title++;

        stats.detailedChanges.push(change);
      });
    });

    return { normalized, stats };
  }

  revertChanges(contact: Contact): Contact {
    const originalChanges = this.changes.filter(change => 
      Object.keys(contact).includes(change.field as string)
    );

    const reverted = { ...contact };
    originalChanges.forEach(change => {
      reverted[change.field] = change.originalValue as any;
    });

    return reverted;
  }

  getNormalizationStats(): NormalizationStats {
    const stats: NormalizationStats = {
      totalChanges: this.changes.length,
      changesByField: {} as Record<keyof Contact, number>,
      changesByRule: {},
      changesByType: {
        email: 0,
        phone: 0,
        name: 0,
        company: 0,
        title: 0
      },
      detailedChanges: this.changes
    };

    this.changes.forEach(change => {
      // Update changes by field
      if (!stats.changesByField[change.field]) {
        stats.changesByField[change.field] = 0;
      }
      stats.changesByField[change.field]++;

      // Update changes by rule
      if (!stats.changesByRule[change.ruleApplied]) {
        stats.changesByRule[change.ruleApplied] = 0;
      }
      stats.changesByRule[change.ruleApplied]++;

      // Update changes by type
      if (change.field === 'email') stats.changesByType.email++;
      if (change.field === 'phone') stats.changesByType.phone++;
      if (change.field === 'name') stats.changesByType.name++;
      if (change.field === 'company') stats.changesByType.company++;
      if (change.field === 'title') stats.changesByType.title++;
    });

    return stats;
  }

  clearChanges(): void {
    this.changes = [];
  }
} 