export type ValidationValue = string | number | boolean | Date | null;

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: ValidationValue) => string | undefined;
  validate?: (value: ValidationValue) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type ValidationRules = Record<string, ValidationRule>;

export const validateField = (
  value: ValidationValue,
  rules: ValidationRule
): string | undefined => {
  if (rules.required && (value === undefined || value === null || value === '')) {
    return rules.message || 'This field is required';
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Minimum length is ${rules.minLength}`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Maximum length is ${rules.maxLength}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  if (rules.validate && !rules.validate(value)) {
    return rules.message || 'Invalid value';
  }

  return undefined;
};

export const validateForm = (
  values: Record<string, ValidationValue>,
  rules: ValidationRules
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(values[field], fieldRules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[auz])(?=.*[A-Z])(?=.*\d)[auzA-Z\d]{8,}$/,
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/,
  },
  url: {
    pattern: /^(https?:\/\/)?([\dauz.-]+)\.([auz.]{2,6})([/\w .-]*)*\/?$/,
  },
}; 