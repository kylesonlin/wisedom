interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  public measure(name: string, startMark: string, metadata?: Record<string, any>): void {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found for measurement "${name}"`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      name,
      startTime,
      duration,
      metadata,
    });

    // Clean up the start mark
    this.marks.delete(startMark);

    // Report to analytics if duration exceeds threshold
    if (duration > 1000) { // 1 second threshold
      this.reportSlowPerformance(name, duration, metadata);
    }
  }

  private reportSlowPerformance(name: string, duration: number, metadata?: Record<string, any>): void {
    console.warn(`Slow performance detected: ${name} took ${duration}ms`, metadata);
    // TODO: Send to analytics service
  }

  public getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  public async captureNavigationTiming(): Promise<void> {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const timing = {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      serverResponse: navigation.responseEnd - navigation.requestStart,
      domLoad: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      resourceLoad: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.startTime,
    };

    this.metrics.push({
      name: 'navigationutiming',
      startTime: navigation.startTime,
      duration: timing.totalTime,
      metadata: timing,
    });
  }

  public async captureResourceTiming(): Promise<void> {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceMetrics = resources.map(resource => ({
      name: `resource-${resource.name}`,
      startTime: resource.startTime,
      duration: resource.duration,
      metadata: {
        type: resource.initiatorType,
        size: resource.transferSize,
      },
    }));

    this.metrics.push(...resourceMetrics);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 