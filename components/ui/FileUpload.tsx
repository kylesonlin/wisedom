"use client";

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Upload, X } from 'lucide-react';

export interface FileUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      error,
      helperText,
      accept,
      multiple = false,
      maxSize = 5,
      onFilesChange,
      className,
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files || []);
      if (validateFiles(newFiles)) {
        setFiles(multiple ? [...files, ...newFiles] : newFiles);
        onFilesChange?.(multiple ? [...files, ...newFiles] : newFiles);
      }
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const newFiles = Array.from(e.dataTransfer.files);
      if (validateFiles(newFiles)) {
        setFiles(multiple ? [...files, ...newFiles] : newFiles);
        onFilesChange?.(multiple ? [...files, ...newFiles] : newFiles);
      }
    };

    const validateFiles = (newFiles: File[]): boolean => {
      for (const file of newFiles) {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File ${file.name} exceeds the maximum size of ${maxSize}MB`);
          return false;
        }
      }
      return true;
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-background transition-colors hover:border-primary',
            dragActive && 'border-primary bg-primary/5',
            error && 'border-destructive',
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            ref={ref}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: {maxSize}MB
          </p>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-input bg-background p-2"
              >
                <span className="text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export { FileUpload }; 