import { performance } from 'perf_hooks';
import performanceBudget from '../config/performance-budget';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'good' | 'poor' | 'warning';
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  target?: Element;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
  sources?: Array<{
    node?: Node;
    currentRect?: DOMRectReadOnly;
    previousRect?: DOMRectReadOnly;
  }>;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Set<(metrics: PerformanceMetric[]) => void> = new Set();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP Observer
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as FirstInputEntry[];
        entries.forEach(entry => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS Observer
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries() as LayoutShiftEntry[];
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  public recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);
    this.checkThresholds();
  }

  public measureApiCall(url: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.recordMetric(`api_${url}`, duration);
  }

  public measureResourceLoad(resource: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.recordMetric(`resource_${resource}`, duration);
  }

  public measureBundleSize(type: 'js' | 'css', size: number) {
    this.recordMetric(`bundle_${type}`, size);
  }

  private checkThresholds() {
    const currentMetrics: PerformanceMetric[] = [];

    // Check Core Web Vitals
    this.checkCoreWebVitals(currentMetrics);

    // Check API Performance
    this.checkApiPerformance(currentMetrics);

    // Check Resource Timing
    this.checkResourceTiming(currentMetrics);

    // Check Bundle Sizes
    this.checkBundleSizes(currentMetrics);

    // Notify observers
    this.notifyObservers(currentMetrics);
  }

  private checkCoreWebVitals(metrics: PerformanceMetric[]) {
    const lcp = this.getLatestMetric('lcp');
    const fid = this.getLatestMetric('fid');
    const cls = this.getLatestMetric('cls');

    if (lcp) {
      metrics.push({
        name: 'LCP',
        value: lcp,
        threshold: performanceBudget.coreWebVitals.lcp.good,
        status: this.getStatus(lcp, performanceBudget.coreWebVitals.lcp)
      });
    }

    if (fid) {
      metrics.push({
        name: 'FID',
        value: fid,
        threshold: performanceBudget.coreWebVitals.fid.good,
        status: this.getStatus(fid, performanceBudget.coreWebVitals.fid)
      });
    }

    if (cls) {
      metrics.push({
        name: 'CLS',
        value: cls,
        threshold: performanceBudget.coreWebVitals.cls.good,
        status: this.getStatus(cls, performanceBudget.coreWebVitals.cls)
      });
    }
  }

  private checkApiPerformance(metrics: PerformanceMetric[]) {
    const apiMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith('api_'));

    apiMetrics.forEach(([key, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      metrics.push({
        name: `API ${key.replace('api_', '')}`,
        value: avg,
        threshold: performanceBudget.api.responseTime.p90,
        status: this.getStatus(avg, { good: performanceBudget.api.responseTime.p90, poor: performanceBudget.api.responseTime.p99 })
      });
    });
  }

  private checkResourceTiming(metrics: PerformanceMetric[]) {
    const resourceMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith('resource_'));

    resourceMetrics.forEach(([key, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      metrics.push({
        name: `Resource ${key.replace('resource_', '')}`,
        value: avg,
        threshold: performanceBudget.resourceTiming.resourceLoad,
        status: this.getStatus(avg, { good: performanceBudget.resourceTiming.resourceLoad, poor: performanceBudget.resourceTiming.resourceLoad * 1.5 })
      });
    });
  }

  private checkBundleSizes(metrics: PerformanceMetric[]) {
    const bundleMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith('bundle_'));

    bundleMetrics.forEach(([key, values]) => {
      const size = values[values.length - 1];
      const type = key.replace('bundle_', '') as 'js' | 'css';
      metrics.push({
        name: `Bundle ${type.toUpperCase()}`,
        value: size,
        threshold: performanceBudget.bundleSize[type].initial,
        status: this.getStatus(size, { good: performanceBudget.bundleSize[type].initial, poor: performanceBudget.bundleSize[type].total })
      });
    });
  }

  private getLatestMetric(name: string): number | undefined {
    const values = this.metrics.get(name);
    return values ? values[values.length - 1] : undefined;
  }

  private getStatus(value: number, thresholds: { good: number; poor: number }): 'good' | 'poor' | 'warning' {
    if (value <= thresholds.good) return 'good';
    if (value >= thresholds.poor) return 'poor';
    return 'warning';
  }

  public subscribe(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  private notifyObservers(metrics: PerformanceMetric[]) {
    this.observers.forEach(callback => callback(metrics));
  }

  public getMetrics(): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    this.checkThresholds();
    return metrics;
  }

  public reset() {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor(); 