'use client';

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { SecurityDashboard } from '@/components/SecurityDashboard';

export default function SecurityPage() {
  return (
    <MainLayout>
      <SecurityDashboard />
    </MainLayout>
  );
} 