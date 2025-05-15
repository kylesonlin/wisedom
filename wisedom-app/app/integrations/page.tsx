import { Suspense } from 'react';
import IntegrationsClient from './IntegrationsClient';

export const dynamic = 'force-dynamic';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntegrationsClient />
    </Suspense>
  );
} 