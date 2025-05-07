import { ReactNode } from 'react';
import { Layout } from './Layout';
import { Page } from './Page';
import { Providers } from './Providers';

interface DashboardClientProps {
  children: ReactNode;
}

export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <Providers>
      <Layout>
        <Page>{children}</Page>
      </Layout>
    </Providers>
  );
} 