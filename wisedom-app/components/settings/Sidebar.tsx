'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsNav = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: 'User',
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: 'Shield',
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: 'Bell',
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: 'Settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 border-r bg-gray-50 p-4">
      <div className="space-y-1">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="mr-3">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 