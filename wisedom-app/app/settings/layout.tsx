import { Metadata } from 'next';
import { Sidebar } from '@/components/settings/Sidebar';

export const metadata: Metadata = {
  title: 'Settings | Contact Management System',
  description: 'Manage your account settings and preferences.',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
} 