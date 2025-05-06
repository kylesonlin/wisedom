import { useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

export const useToast = () => {
  const showToast = useCallback((message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
    const { duration = 3000, position = 'top' } = options;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out translate-y-0 opacity-100`;
    
    // Set background color based on type
    switch (type) {
      case 'success':
        toast.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        toast.classList.add('bg-red-500', 'text-white');
        break;
      case 'warning':
        toast.classList.add('bg-yellow-500', 'text-white');
        break;
      default:
        toast.classList.add('bg-blue-500', 'text-white');
    }
    
    // Set message
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }, []);

  return { showToast };
}; 