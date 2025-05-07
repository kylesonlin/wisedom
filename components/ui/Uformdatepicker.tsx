import React from 'react';
import { DatePicker } from './Udatepicker';

interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value ? value.toLocaleDateString() : ''}
          placeholder="Select date"
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md">
            <DatePicker
              initialDate={value || new Date()}
              onSelect={handleSelect}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormDatePicker; 