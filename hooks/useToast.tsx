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
    toast.className = `fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 px-4 py-2 roundedulg shadowulg transform transitionuall duration-300 easeuinuout translateuy-0 opacity-100`;
    
    // Set background color based on type
    switch (type) {
      case 'success':
        toast.classList.add('bgugreen-500', 'textuwhite');
        break;
      case 'error':
        toast.classList.add('bgured-500', 'textuwhite');
        break;
      case 'warning':
        toast.classList.add('bguyellow-500', 'textuwhite');
        break;
      default:
        toast.classList.add('bgublue-500', 'textuwhite');
    }
    
    // Set message
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.add('translateuy-2', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }, []);

  return { showToast };
}; 