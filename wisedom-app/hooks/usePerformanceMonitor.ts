import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'good' | 'poor' | 'warning';
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const measureApiCall = (url: string) => {
    const startTime = performance.now();
    return () => {
      performanceMonitor.measureApiCall(url, startTime);
    };
  };

  const measureResourceLoad = (resource: string) => {
    const startTime = performance.now();
    return () => {
      performanceMonitor.measureResourceLoad(resource, startTime);
    };
  };

  const measureBundleSize = (type: 'js' | 'css', size: number) => {
    performanceMonitor.measureBundleSize(type, size);
  };

  return {
    metrics,
    measureApiCall,
    measureResourceLoad,
    measureBundleSize,
  };
} 