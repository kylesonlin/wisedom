import { ReactNode } from 'react';
import DashboardLayout from '@/app/components/Layout';
import PageContainer from '@/app/components/Page';
import { Providers } from './Providers';

interface DashboardClientProps {
  children: ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  return (
    <Providers>
      <DashboardLayout>
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
    </Providers>
  );
} 