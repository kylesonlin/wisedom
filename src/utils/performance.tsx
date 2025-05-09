interface PerformanceMetadata {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  timestamp?: number;
  environment?: string;
  version?: string;
  customData?: Record<string, string | number | boolean | null>;
}

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  metadata?: PerformanceMetadata;
}

export class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private slowThreshold: number;

  constructor(slowThreshold: number = 1000) {
    this.slowThreshold = slowThreshold;
  }

  public measure(name: string, startMark: string, metadata?: PerformanceMetadata): void {
    const start = performance.getEntriesByName(startMark)[0];
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return;
    }

    const duration = performance.now() - start.startTime;
    const entry: PerformanceEntry = {
      name,
      duration,
      startTime: start.startTime,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
      },
    };

    this.entries.push(entry);

    if (duration > this.slowThreshold) {
      this.reportSlowPerformance(name, duration, metadata);
    }
  }

  public getEntries(): PerformanceEntry[] {
    return this.entries;
  }

  public clearEntries(): void {
    this.entries = [];
  }

  private reportSlowPerformance(name: string, duration: number, metadata?: PerformanceMetadata): void {
    console.warn(`Slow performance detected for "${name}":`, {
      duration,
      threshold: this.slowThreshold,
      metadata,
    });
  }
}

export const performanceMonitor = new PerformanceMonitor(); 