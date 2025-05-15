import { Metadata } from 'next';
import Layout from '../layout';

export const metadata: Metadata = {
  title: 'Security Settings | Contact Management System',
  description: 'Manage your account security settings, including two-factor authentication and password settings.',
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      {children}
    </Layout>
  );
} 