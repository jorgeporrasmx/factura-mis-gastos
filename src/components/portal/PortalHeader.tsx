'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';
import { Menu } from 'lucide-react';

interface PortalHeaderProps {
  title?: string;
}

export function PortalHeader({ title }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile: Logo */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/portal" className="text-lg font-bold text-blue-600">
            FMG
          </Link>
        </div>

        {/* Desktop: Page title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900">
            {title || 'Mi Portal'}
          </h1>
        </div>

        {/* Mobile: Page title (centered) */}
        {title && (
          <h1 className="md:hidden text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>
        )}

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
