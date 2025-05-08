export const cn = (...inputs: any[]) => {
  return inputs.filter(Boolean).join(' ');
}; 