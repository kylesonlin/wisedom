import { Suspense } from 'react';
import IntegrationsClient from './Uintegrationsclient';

export const dynamic = 'force-dynamic';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntegrationsClient />
    </Suspense>
  );
} 