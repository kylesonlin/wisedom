import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const toast = (options: ToastOptions) => {
  const { title, description, variant = 'default', duration = 5000 } = options;

  sonnerToast[variant === 'destructive' ? 'error' : 'success'](title, {
    description,
    duration,
  });
}; 