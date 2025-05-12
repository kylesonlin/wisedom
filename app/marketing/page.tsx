'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const features = [
  {
    name: 'Contact Management',
    description: 'Keep track of all your professional contacts in one place. Never miss an important interaction or follow-up.',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ),
  },
  {
    name: 'Task Tracking',
    description: 'Manage your tasks and follow-ups efficiently. Set reminders and stay on top of your commitments.',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ),
  },
  {
    name: 'Analytics & Insights',
    description: 'Get valuable insights into your network activity and relationship strength over time.',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 17a2 2 0 104 0m-4 0a2 2 0 01-4 0m8 0a2 2 0 01-4 0m4 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2z" /></svg>
    ),
  },
];

const testimonials = [
  {
    quote: 'Wisedom.ai helped me reconnect with key contacts and close more deals than ever before.',
    name: 'Alex, Sales Leader',
  },
  {
    quote: 'The AI insights are a game changer for my networking and business growth.',
    name: 'Jamie, Entrepreneur',
  },
];

function MarketingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          Transform Your Network<br />
          <span className="text-primary">Into a Strategic Advantage</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          Wisedom.ai empowers you to manage relationships, track interactions, and unlock new opportunities—all in one powerful dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-8 py-4 text-lg">
            <Link href="https://app.wisedom.ai">Launch App</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
            <Link href="https://app.wisedom.ai/auth/signin">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div key={feature.name} className="bg-card p-8 rounded-xl shadow flex flex-col items-center text-center">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card p-8 rounded-xl shadow text-center">
              <p className="italic mb-4 text-lg">“{t.quote}”</p>
              <span className="font-semibold text-primary">– {t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to unlock your network's full potential?</h2>
        <Button asChild size="lg" className="px-8 py-4 text-lg">
          <Link href="https://app.wisedom.ai">Get Started</Link>
        </Button>
      </section>
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

export default function MarketingPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<MarketingSkeleton />}>
        <MarketingContent />
      </Suspense>
    </ErrorBoundary>
  );
} 