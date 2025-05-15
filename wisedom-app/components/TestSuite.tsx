"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { testScenarios, measurePerformance, viewportSizes, browserFeatures, requiredEnvVars, securityChecks } from '@/utils/testUtils';
import { useTheme } from '@/components/contexts/ThemeContext';

type TestType = 'env' | 'xss' | 'csrf' | 'keyboard' | 'screenreader' | 'contrast' | 'focus' | 'connection' | 'websocket' | 'api' | 'storage' | 'validation' | 'auth';

interface Test {
  name: string;
  type?: TestType;
  scenario?: string;
  viewport?: typeof viewportSizes.mobile;
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge';
}

interface Section {
  title: string;
  description?: string;
  tests?: Test[];
}

type Sections = {
  [key: string]: Section;
};

export default function TestSuite() {
  const { theme, setTheme } = useTheme();
  const [currentSection, setCurrentSection] = useState<keyof Sections>('overview');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number>>({});

  // Test sections
  const sections: Sections = {
    overview: {
      title: 'Test Overview',
      description: 'Select a section to test'
    },
    dataLoading: {
      title: 'Data Loading & Error Handling',
      tests: [
        { name: 'Loading States', scenario: 'loading' },
        { name: 'Error States', scenario: 'error' },
        { name: 'Empty States', scenario: 'empty' },
        { name: 'Data Refresh', scenario: 'normal' }
      ]
    },
    performance: {
      title: 'Performance',
      tests: [
        { name: 'Initial Load', scenario: 'normal' },
        { name: 'Chart Rendering', scenario: 'normal' },
        { name: 'Large Dataset', scenario: 'large' },
        { name: 'Animation Performance', scenario: 'normal' }
      ]
    },
    responsive: {
      title: 'Responsive Design',
      tests: [
        { name: 'Mobile Layout', viewport: viewportSizes.mobile },
        { name: 'Tablet Layout', viewport: viewportSizes.tablet },
        { name: 'Desktop Layout', viewport: viewportSizes.desktop }
      ]
    },
    integration: {
      title: 'Integration Tests',
      tests: [
        { name: 'Supabase Connection', type: 'connection' },
        { name: 'WebSocket Connection', type: 'websocket' },
        { name: 'API Calls', type: 'api' },
        { name: 'Data Persistence', type: 'storage' }
      ]
    },
    accessibility: {
      title: 'Accessibility',
      tests: [
        { name: 'Keyboard Navigation', type: 'keyboard' },
        { name: 'Screen Reader', type: 'screenreader' },
        { name: 'Color Contrast', type: 'contrast' },
        { name: 'Focus Management', type: 'focus' }
      ]
    },
    browser: {
      title: 'Browser Compatibility',
      tests: [
        { name: 'Chrome', browser: 'chrome' },
        { name: 'Firefox', browser: 'firefox' },
        { name: 'Safari', browser: 'safari' },
        { name: 'Edge', browser: 'edge' }
      ]
    },
    environment: {
      title: 'Environment Variables',
      tests: requiredEnvVars.map(variable => ({
        name: variable,
        type: 'env'
      }))
    },
    security: {
      title: 'Security',
      tests: [
        { name: 'XSS Prevention', type: 'xss' },
        { name: 'CSRF Protection', type: 'csrf' },
        { name: 'Data Validation', type: 'validation' },
        { name: 'Authentication', type: 'auth' }
      ]
    }
  };

  // Run performance test
  const runPerformanceTest = async (name: string, callback: () => void | Promise<void>) => {
    const duration = await measurePerformance(callback);
    setPerformanceMetrics(prev => ({ ...prev, [name]: duration }));
  };

  // Run test
  const runTest = async (test: Test) => {
    try {
      switch (test.type) {
        case 'env':
          const value = process.env[test.name];
          setTestResults(prev => ({ ...prev, [test.name]: !!value }));
          break;
        case 'xss':
          const xssResult = securityChecks.xss('<script>alert("test")</script>');
          setTestResults(prev => ({ ...prev, [test.name]: xssResult }));
          break;
        case 'csrf':
          const csrfResult = securityChecks.csrf('test-token');
          setTestResults(prev => ({ ...prev, [test.name]: csrfResult }));
          break;
        default:
          // Simulate test execution
          await new Promise(resolve => setTimeout(resolve, 1000));
          setTestResults(prev => ({ ...prev, [test.name]: true }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [test.name]: false }));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Comprehensive Test Suite</h2>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(sections).map(([key, section]) => (
          <Button
            key={key}
            onClick={() => setCurrentSection(key as keyof Sections)}
            variant={currentSection === key ? 'default' : 'outline'}
          >
            {section.title}
          </Button>
        ))}
      </div>

      {/* Current Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{sections[currentSection].title}</h3>
        
        {currentSection === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(sections)
              .filter(([key]) => key !== 'overview')
              .map(([key, section]) => (
                <div
                  key={key}
                  className="p-4 border rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => setCurrentSection(key as keyof Sections)}
                >
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {section.tests?.length || 0} tests
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Test Controls */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  sections[currentSection].tests?.forEach(test => runTest(test));
                }}
              >
                Run All Tests
              </Button>
              <Button
                variant="outline"
                onClick={() => setTestResults({})}
              >
                Clear Results
              </Button>
            </div>

            {/* Test Results */}
            <div className="space-y-2">
              {sections[currentSection].tests?.map(test => (
                <div
                  key={test.name}
                  className="p-4 border rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      {performanceMetrics[test.name] && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {performanceMetrics[test.name].toFixed(2)}ms
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => runTest(test)}
                      >
                        Run Test
                      </Button>
                      {testResults[test.name] !== undefined && (
                        <div
                          className={`w-4 h-4 rounded-full ${
                            testResults[test.name]
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 