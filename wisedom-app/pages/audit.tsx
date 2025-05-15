import React from 'react';
import { NextPage } from 'next';
import MainLayout from '../components/MainLayout';
import AuditLogs from '../components/AuditLogs';

const AuditPage: NextPage = () => {
  return (
    <MainLayout>
      <AuditLogs />
    </MainLayout>
  );
};

export default AuditPage; 