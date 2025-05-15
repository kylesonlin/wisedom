"use client";

import { useState, useEffect } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      type: 'info',
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    if (options.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options.duration || 5000);
    }
  };

  return { toast, toasts };
} 