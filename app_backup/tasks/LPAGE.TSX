import { Suspense } from 'react';
import TasksClient from './Utasksclient';

export default function TasksPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <Suspense fallback={<div>Loading tasks...</div>}>
        <TasksClient />
      </Suspense>
    </div>
  );
} 