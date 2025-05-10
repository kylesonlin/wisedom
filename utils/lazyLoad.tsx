import React, { Suspense, ComponentType, ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoadWrapper({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): ComponentType<ComponentProps<T>> {
  const LazyComponent = React.lazy(importFunc);

  return function LazyLoadComponent(props: ComponentProps<T>) {
    return (
      <LazyLoadWrapper>
        <LazyComponent {...props} />
      </LazyLoadWrapper>
    );
  };
} 