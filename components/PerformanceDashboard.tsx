"use client"

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'good' | 'poor' | 'warning';
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (value: number, name: string) => {
    if (name.includes('Bundle')) {
      return `${(value / 1024).toFixed(1)}KB`;
    }
    if (name.includes('CLS')) {
      return value.toFixed(3);
    }
    return `${value.toFixed(0)}ms`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="p-4 border rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{metric.name}</h3>
              <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Current: {formatValue(metric.value, metric.name)}</span>
              <span>Target: {formatValue(metric.threshold, metric.name)}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  metric.status === 'good'
                    ? 'bg-green-500'
                    : metric.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(
                    (metric.value / metric.threshold) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 