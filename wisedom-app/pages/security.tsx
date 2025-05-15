import React from 'react';
import { NextPage } from 'next';
import MainLayout from '../components/MainLayout';
import { SecurityDashboard } from '../components/SecurityDashboard';

const SecurityPage: NextPage = () => {
  return (
    <MainLayout>
      <SecurityDashboard />
    </MainLayout>
  );
};

export default SecurityPage; 