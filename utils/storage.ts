export const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

export const setLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}; 