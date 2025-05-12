'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

function MarketingContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Your Mission Control for Network Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Wisedom helps you manage your professional network, track interactions, and stay on top of your relationships. 
              All in one powerful dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="https://app.wisedom.ai">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="https://app.wisedom.ai/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Link href="#features" className="text-sm font-semibold leading-6 text-foreground">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful features for network management
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center space-y-6">
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-24 w-full" />
            <div className="flex items-center justify-center gap-x-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center space-y-4">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Contact Management',
    description: 'Keep track of all your professional contacts in one place. Never miss an important interaction or follow-up.',
  },
  {
    name: 'Task Tracking',
    description: 'Manage your tasks and follow-ups efficiently. Set reminders and stay on top of your commitments.',
  },
  {
    name: 'Analytics & Insights',
    description: 'Get valuable insights into your network activity and relationship strength over time.',
  },
];

export default function MarketingPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<MarketingSkeleton />}>
        <MarketingContent />
      </Suspense>
    </ErrorBoundary>
  );
} 