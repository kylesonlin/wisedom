import { Suspense } from 'react';
import ImportContactsClient from './Uimportcontactsclient';

export const dynamic = 'force-dynamic';

export default function ImportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImportContactsClient />
    </Suspense>
  );
} 