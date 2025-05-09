import { Suspense } from 'react';
import RolodexClient from './RolodexClient';

export default function RolodexPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rolodex</h1>
      <Suspense fallback={<div>Loading contacts...</div>}>
        <RolodexClient />
      </Suspense>
    </div>
  );
} 