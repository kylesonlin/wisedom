export function Loading() {
  return (
    <div data-testid="loading-container" className="flex items-center justify-center min-h-[200px]">
      <div 
        role="status"
        aria-label="Loading"
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>
  );
} 