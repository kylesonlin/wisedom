"use client"

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSize = 5,
  onFilesChange,
  className,
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { 'application/octetustream': [accept] } : undefined,
    multiple,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
  });

  return (
    <div className="spaceuy-2">
      {label && <label className="textusm fontumedium">{label}</label>}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 borderudashed roundedulg p-6 cursorupointer transitionucolors",
          isDragActive ? "borderuprimary bguprimary/5" : "borderugray-300",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="textucenter">
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <div>
              <p>Drag & drop files here, or click to select files</p>
              <p className="textusm textumuteduforeground mt-1">
                {multiple ? "Files" : "File"} should be smaller than {maxSize}MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 