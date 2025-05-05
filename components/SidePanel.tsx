import React from 'react';
import Link from 'next/link';

interface SidePanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navLinks = [
  { name: 'Dashboard', href: '/app' },
  { name: 'Integrations', href: '/app/integrations' },
  { name: 'Contacts', href: '/app/contacts' },
  { name: 'Settings', href: '/app/settings' },
];

export default function SidePanel({ open, setOpen }: SidePanelProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      {/* Side Panel */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 md:translate-x-0 md:static md:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <div className="font-bold text-lg text-primary mb-8">Mission Control</div>
          <ul className="flex-1 space-y-4">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link href={link.href} legacyBehavior>
                  <a className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-800 font-medium" onClick={() => setOpen(false)}>
                    {link.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Wisedom</div>
        </div>
      </nav>
    </>
  );
} 